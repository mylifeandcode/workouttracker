using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Security.Services;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Users.Models;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Users.Services
{
    /// <summary>
    /// Password reset by one-time token. The token is 256 random bits; only its SHA-256 hash is stored (on the user, with an
    /// expiry), so a copy of the database can't be used to reset anyone's password. There is one live token per user:
    /// asking for another replaces the first. A token works once, and it is only ever handed over by email or by an
    /// administrator, never in the response to the public request.
    /// </summary>
    public class PasswordResetService : IPasswordResetService
    {
        public const int DefaultTokenLifetimeMinutes = 60;

        //Stops anyone using the public form to bury a victim's inbox in reset emails.
        public static readonly TimeSpan RequestCooldown = TimeSpan.FromMinutes(2);

        private const string SYSTEM_USER_NAME = "SYSTEM";
        private const int TOKEN_BYTES = 32;
        private const int MAX_TOKEN_LENGTH = 128;

        private readonly IRepository<User> _userRepo;
        private readonly ICryptoService _cryptoService;
        private readonly IEmailService _emailService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly ILogger<PasswordResetService> _logger;
        private readonly TimeProvider _timeProvider;
        private readonly string _resetPageUrl;
        private readonly TimeSpan _tokenLifetime;

        public PasswordResetService(
            IRepository<User> userRepo,
            ICryptoService cryptoService,
            IEmailService emailService,
            IRefreshTokenService refreshTokenService,
            IConfiguration configuration,
            ILogger<PasswordResetService> logger,
            TimeProvider? timeProvider = null)
        {
            _userRepo = userRepo ?? throw new ArgumentNullException(nameof(userRepo));
            _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _refreshTokenService = refreshTokenService ?? throw new ArgumentNullException(nameof(refreshTokenService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _timeProvider = timeProvider ?? TimeProvider.System;

            _resetPageUrl = NormalizeResetPageUrl(configuration?["FrontEndResetPasswordURL"]);

            var lifetimeMinutes = int.TryParse(configuration?["PasswordReset:TokenLifetimeMinutes"], out var minutes) && minutes > 0
                ? minutes
                : DefaultTokenLifetimeMinutes;
            _tokenLifetime = TimeSpan.FromMinutes(lifetimeMinutes);
        }

        /// <summary>
        /// Checks the configured address of the reset page (e.g. https://app.example.com/user/reset-password) and returns it
        /// without a trailing slash. Also called at startup, so a bad value stops the API there instead of quietly producing
        /// broken links in emails.
        /// </summary>
        public static string NormalizeResetPageUrl(string? configuredUrl)
        {
            if (!Uri.TryCreate(configuredUrl?.Trim(), UriKind.Absolute, out var uri)
                || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
                || !string.IsNullOrEmpty(uri.Fragment)
                || !string.IsNullOrEmpty(uri.Query))
            {
                throw new InvalidOperationException(
                    "FrontEndResetPasswordURL must be the full address of the reset page, with no query or fragment, " +
                    "e.g. \"https://app.example.com/user/reset-password\".");
            }

            return uri.GetLeftPart(UriPartial.Path).TrimEnd('/');
        }

        public async Task RequestResetEmailAsync(string? emailAddress, CancellationToken cancellationToken = default)
        {
            //Nothing could be delivered, so don't create a token that nobody can use.
            if (!_emailService.IsEnabled || string.IsNullOrWhiteSpace(emailAddress))
                return;

            try
            {
                var address = emailAddress.Trim();
                var user = await _userRepo.Get().FirstOrDefaultAsync(
                    x => x.EmailAddress == address && x.IsActive && x.Name != SYSTEM_USER_NAME, cancellationToken);

                if (user == null || WasIssuedRecently(user))
                    return;

                var token = await IssueTokenAsync(user, cancellationToken);

                await _emailService.SendEmailAsync(
                    user.EmailAddress,
                    "noreply@workouttracker.com",
                    "Reset your WorkoutTracker password",
                    BuildEmailBody(token),
                    cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                //Logged, not returned: a failure that only happens for real addresses would tell a caller which ones exist.
                //The address itself is left out of the log.
                _logger.LogError(ex, "A password reset request could not be completed.");
            }
        }

        public async Task<PasswordResetIssueOutcome> CreateResetForAdminAsync(Guid publicId, int actingUserId, CancellationToken cancellationToken = default)
        {
            //Checked against the database, not the caller's token, so a demoted or deactivated administrator can't use one
            //issued before that happened.
            if (!await _userRepo.AnyAsync(x => x.Id == actingUserId && x.IsActive && x.Role == UserRole.Administrator, cancellationToken))
                return new PasswordResetIssueOutcome(PasswordResetResult.NotPermitted);

            var user = await _userRepo.Get().FirstOrDefaultAsync(
                x => x.PublicId == publicId && x.IsActive && x.Name != SYSTEM_USER_NAME, cancellationToken);
            if (user == null)
                return new PasswordResetIssueOutcome(PasswordResetResult.NotFound);

            var token = await IssueTokenAsync(user, cancellationToken);

            //An audit trail of who handed out a way into whose account. The token is never logged.
            _logger.LogInformation("Administrator {ActingUserId} created a password reset for user {UserId}.", actingUserId, user.Id);

            return new PasswordResetIssueOutcome(PasswordResetResult.Done, token, user.PasswordResetTokenExpiresAt);
        }

        public async Task<bool> ValidateTokenAsync(string? token, CancellationToken cancellationToken = default)
        {
            return await FindUserByTokenAsync(token, cancellationToken) != null;
        }

        public async Task<PasswordResetOutcome> ResetPasswordAsync(string? token, string? newPassword, CancellationToken cancellationToken = default)
        {
            var user = await FindUserByTokenAsync(token, cancellationToken);
            if (user == null)
                return new PasswordResetOutcome(PasswordResetResult.InvalidToken);

            //A rejected password doesn't spend the token, so they can try again with a better one.
            var passwordProblem = PasswordPolicy.Validate(newPassword);
            if (passwordProblem != null)
                return new PasswordResetOutcome(PasswordResetResult.InvalidPassword, passwordProblem);

            //A fresh salt as well as a fresh hash: the old salt belongs to the password being replaced.
            user.Salt = _cryptoService.GenerateSalt();
            user.HashedPassword = _cryptoService.ComputeHash(newPassword!, user.Salt);
            user.PasswordResetTokenHash = null;
            user.PasswordResetTokenExpiresAt = null;
            await _userRepo.UpdateAsync(user, true, cancellationToken);

            //Whoever was signed in as this user, including anyone who had got into the account, has to sign in again.
            await _refreshTokenService.RevokeByUserIdAsync(user.Id, cancellationToken);

            return new PasswordResetOutcome(PasswordResetResult.Done);
        }

        private async Task<string> IssueTokenAsync(User user, CancellationToken cancellationToken)
        {
            var token = GenerateToken();

            user.PasswordResetTokenHash = RefreshTokenService.ComputeSha256Hash(token);
            user.PasswordResetTokenExpiresAt = _timeProvider.GetUtcNow().UtcDateTime + _tokenLifetime;
            await _userRepo.UpdateAsync(user, true, cancellationToken);

            return token;
        }

        private async Task<User?> FindUserByTokenAsync(string? token, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(token) || token.Length > MAX_TOKEN_LENGTH)
                return null;

            var hash = RefreshTokenService.ComputeSha256Hash(token.Trim());
            var user = await _userRepo.Get().FirstOrDefaultAsync(x => x.PasswordResetTokenHash == hash && x.IsActive, cancellationToken);

            if (user?.PasswordResetTokenExpiresAt is not { } expiresAt || expiresAt <= _timeProvider.GetUtcNow().UtcDateTime)
                return null;

            return user;
        }

        //A token issued less than RequestCooldown ago. When it was issued is worked out from its expiry.
        private bool WasIssuedRecently(User user)
        {
            if (user.PasswordResetTokenExpiresAt is not { } expiresAt)
                return false;

            var issuedAt = expiresAt - _tokenLifetime;
            return issuedAt > _timeProvider.GetUtcNow().UtcDateTime - RequestCooldown;
        }

        private string BuildEmailBody(string token)
        {
            var minutes = (int)_tokenLifetime.TotalMinutes;

            //The token goes after a #, so browsers never send it to any server and it stays out of logs and Referer headers.
            return
                "A password reset was requested for your WorkoutTracker account." + Environment.NewLine + Environment.NewLine +
                $"To choose a new password, open this link. It works once and expires in {minutes} minutes:" + Environment.NewLine +
                $"{_resetPageUrl}#token={token}" + Environment.NewLine + Environment.NewLine +
                "If you didn't ask for this, you can ignore this message. Your password won't change.";
        }

        //URL-safe base64 of 256 random bits (43 characters, no padding).
        private static string GenerateToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(TOKEN_BYTES))
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }
    }
}
