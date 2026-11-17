using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Shared.BaseClasses;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Users.Models;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Users.Services
{
    public class UserService : PublicEntityServiceBase<User>, IUserService
    {
        private ICryptoService _cryptoService;
        private IEmailService _emailService;
        private IRefreshTokenService _refreshTokenService;
        private string _frontEndResetPasswordUrl;

        //EnsureSeedData creates a hidden SYSTEM user. It is never listed, edited or deactivated.
        private const string SYSTEM_USER_NAME = "SYSTEM";
        private const int MAX_REP_SETTINGS = 20;

        public UserService(
            IRepository<User> repo,
            ICryptoService cryptoService,
            IEmailService emailService,
            IRefreshTokenService refreshTokenService,
            ILogger<UserService> logger,
            string frontEndResetPasswordUrl) : base(repo, logger)
        {
            _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _refreshTokenService = refreshTokenService ?? throw new ArgumentNullException(nameof(refreshTokenService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            if (!string.IsNullOrWhiteSpace(frontEndResetPasswordUrl))
                _frontEndResetPasswordUrl = frontEndResetPasswordUrl;
            else
                throw new ArgumentNullException(nameof(frontEndResetPasswordUrl));
            _logger.LogInformation("UserService constructed");
        }

        public async Task<User> AddAsync(User user, CancellationToken cancellationToken = default)
        {
            //The role is whatever the caller set. The first administrator is created through UserSetupService.
            return await AddAsync(user, true, cancellationToken);
        }

        public override async Task DeleteAsync(int userId, CancellationToken cancellationToken = default)
        {
            //TODO: Delete entities associated with user (workouts, etc)
            await base.DeleteAsync(userId, cancellationToken);
        }

        public async Task<User> UpdateAsync(User user, CancellationToken cancellationToken = default)
        {
            return await UpdateAsync(user, true, cancellationToken);
        }

        public override async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _repo.Get().Where(x => x.Name != "SYSTEM").ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<User>> GetAllWithoutTrackingAsync(CancellationToken cancellationToken = default)
        {
            return await _repo.GetWithoutTracking().Where(x => x.Name != "SYSTEM").ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<UserProfile>> GetAllProfilesAsync(CancellationToken cancellationToken = default)
        {
            //Deactivated users can't sign in, so they aren't offered on the user picker.
            return await _repo.GetWithoutTracking()
                .Where(x => x.Name != "SYSTEM" && x.IsActive)
                .OrderBy(x => x.Name)
                .Select(x => new UserProfile { PublicId = x.PublicId, Name = x.Name })
                .ToListAsync(cancellationToken);
        }

        public override async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _repo.Get()
                .Include(x => x.Settings).ThenInclude(settings => settings.RepSettings)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<User?> GetByPublicIdAsync(Guid publicId, CancellationToken cancellationToken = default)
        {
            return await _repo.GetWithoutTracking()
                .Include(x => x.Settings).ThenInclude(settings => settings.RepSettings)
                .FirstOrDefaultAsync(x => x.PublicId == publicId, cancellationToken);
        }

        public async Task<User?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
        {
            return await _repo.GetWithoutTracking()
                .FirstOrDefaultAsync(x => x.Name == name && x.Name != "SYSTEM", cancellationToken);
        }

        public async Task ChangePasswordAsync(int userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _repo.GetAsync(userId, cancellationToken);

                if (user == null) throw new ApplicationException("User not found.");
                if (!_cryptoService.VerifyValuesMatch(currentPassword, user.HashedPassword, user.Salt))
                    throw new ApplicationException("Current password is not correct.");

                user.HashedPassword = _cryptoService.ComputeHash(newPassword, user.Salt);
                await _repo.UpdateAsync(user, true, cancellationToken);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<string?> RequestPasswordResetAsync(string emailAddress, CancellationToken cancellationToken = default)
        {
            var user = await _repo.Get().FirstOrDefaultAsync(x => x.EmailAddress == emailAddress && x.IsActive, cancellationToken);
            if (user == null)
                return null;

            user.PasswordResetCode = _cryptoService.GeneratePasswordResetCode();
            await _repo.UpdateAsync(user, true, cancellationToken);

            if (_emailService.IsEnabled)
            {
                await _emailService.SendEmailAsync(
                    emailAddress,
                    "noreply@workouttracker.com",
                    "Password Reset",
                    $"A password reset request was received. If you made this request, please go to {_frontEndResetPasswordUrl}/{user.PasswordResetCode}",
                    cancellationToken
                    );
            }

            return user.PasswordResetCode;
        }

        public async Task ResetPasswordAsync(string resetCode, string newPassword, CancellationToken cancellationToken = default)
        {
            var user = await _repo.Get().FirstOrDefaultAsync(user => user.PasswordResetCode == resetCode, cancellationToken);

            if (user == null)
                throw new ApplicationException($"No user found with password reset code {resetCode}.");

            user.HashedPassword = _cryptoService.ComputeHash(newPassword, user.Salt);
            user.PasswordResetCode = null;

            await _repo.UpdateAsync(user, true, cancellationToken);
        }

        public async Task<bool> ValidatePasswordResetCodeAsync(string resetCode, CancellationToken cancellationToken = default)
        {
            return await _repo.Get().AnyAsync(user => user.PasswordResetCode == resetCode, cancellationToken);
        }

        public async Task<bool> IsActiveAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _repo.AnyAsync(x => x.Id == userId && x.IsActive, cancellationToken);
        }

        public async Task<UserAdministrationOutcome> UpdateProfileAsync(
            Guid publicId, string userName, string emailAddress, UserRole role, int actingUserId, CancellationToken cancellationToken = default)
        {
            if (!await IsActiveAdministratorAsync(actingUserId, cancellationToken))
                return new UserAdministrationOutcome(UserAdministrationResult.NotPermitted);

            var validationMessage = ValidateProfile(userName, emailAddress, role);
            if (validationMessage != null)
                return new UserAdministrationOutcome(UserAdministrationResult.InvalidInput, validationMessage);

            //Tracked, and only these fields are assigned: nothing else about the user (password hash, salt, audit
            //fields, settings) is touched. Binding the whole entity from the request used to null the hash and salt.
            var user = await _repo.Get().FirstOrDefaultAsync(x => x.PublicId == publicId && x.Name != SYSTEM_USER_NAME, cancellationToken);
            if (user == null)
                return new UserAdministrationOutcome(UserAdministrationResult.NotFound);

            if (user.Role == UserRole.Administrator && role != UserRole.Administrator
                && user.IsActive && await IsLastActiveAdministratorAsync(user.Id, cancellationToken))
                return new UserAdministrationOutcome(UserAdministrationResult.CannotRemoveLastAdministrator, "The last administrator can't be demoted.");

            user.Name = userName.Trim();
            user.EmailAddress = emailAddress.Trim();
            user.Role = role;
            user.ModifiedByUserId = actingUserId;

            await _repo.UpdateAsync(user, true, cancellationToken);

            return new UserAdministrationOutcome(UserAdministrationResult.Done);
        }

        public async Task<UserAdministrationOutcome> UpdateSettingsAsync(
            int userId, UserSettingsUpdate settings, CancellationToken cancellationToken = default)
        {
            var validationMessage = ValidateSettings(settings);
            if (validationMessage != null)
                return new UserAdministrationOutcome(UserAdministrationResult.InvalidInput, validationMessage);

            var user = await _repo.Get()
                .Include(x => x.Settings).ThenInclude(s => s.RepSettings)
                .FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken);
            if (user == null)
                return new UserAdministrationOutcome(UserAdministrationResult.NotFound);

            var now = DateTime.Now;
            var userSettings = user.Settings;
            userSettings.RecommendationsEnabled = settings.RecommendationsEnabled;
            userSettings.LowestAcceptableRating = settings.LowestAcceptableRating;
            userSettings.ModifiedByUserId = userId;
            userSettings.ModifiedDateTime = now;

            //Reconciled against the rows this user already owns. An id that isn't in that collection (someone else's,
            //or made up) is just treated as a new row, so another user's settings can never be reached from here.
            userSettings.RepSettings ??= new List<UserMinMaxReps>();
            var existing = userSettings.RepSettings.ToDictionary(x => x.Id);
            var keptIds = new HashSet<int>();

            foreach (var incoming in settings.RepSettings)
            {
                if (incoming.Id != 0 && existing.TryGetValue(incoming.Id, out var current))
                {
                    current.SetType = incoming.SetType;
                    current.Duration = incoming.Duration;
                    current.MinReps = incoming.MinReps;
                    current.MaxReps = incoming.MaxReps;
                    current.ModifiedByUserId = userId;
                    current.ModifiedDateTime = now;
                    keptIds.Add(current.Id);
                }
                else
                {
                    userSettings.RepSettings.Add(new UserMinMaxReps
                    {
                        SetType = incoming.SetType,
                        Duration = incoming.Duration,
                        MinReps = incoming.MinReps,
                        MaxReps = incoming.MaxReps,
                        CreatedByUserId = userId,
                        CreatedDateTime = now
                    });
                }
            }

            foreach (var removed in userSettings.RepSettings.Where(x => x.Id != 0 && !keptIds.Contains(x.Id)).ToList())
                userSettings.RepSettings.Remove(removed);

            await _repo.UpdateAsync(user, true, cancellationToken);

            return new UserAdministrationOutcome(UserAdministrationResult.Done);
        }

        public async Task<UserAdministrationOutcome> DeactivateAsync(Guid publicId, int actingUserId, CancellationToken cancellationToken = default)
        {
            if (!await IsActiveAdministratorAsync(actingUserId, cancellationToken))
                return new UserAdministrationOutcome(UserAdministrationResult.NotPermitted);

            var user = await _repo.Get().FirstOrDefaultAsync(x => x.PublicId == publicId, cancellationToken);
            if (user == null)
                return new UserAdministrationOutcome(UserAdministrationResult.NotFound);

            if (user.Name == SYSTEM_USER_NAME)
                return new UserAdministrationOutcome(UserAdministrationResult.CannotDeactivateSystem, "That user can't be deactivated.");

            if (user.Id == actingUserId)
                return new UserAdministrationOutcome(UserAdministrationResult.CannotDeactivateSelf, "You can't deactivate your own account.");

            if (!user.IsActive)
                return new UserAdministrationOutcome(UserAdministrationResult.Done);

            if (user.Role == UserRole.Administrator && await IsLastActiveAdministratorAsync(user.Id, cancellationToken))
                return new UserAdministrationOutcome(UserAdministrationResult.CannotRemoveLastAdministrator, "The last administrator can't be deactivated.");

            user.IsActive = false;
            user.ModifiedByUserId = actingUserId;
            await _repo.UpdateAsync(user, true, cancellationToken);

            //Ends their sessions: no refresh token can be exchanged any more. Their current access token is refused on
            //the next request, because every request checks the user is still active.
            await _refreshTokenService.RevokeByUserIdAsync(user.Id, cancellationToken);

            return new UserAdministrationOutcome(UserAdministrationResult.Done);
        }

        public async Task<UserAdministrationOutcome> ReactivateAsync(Guid publicId, int actingUserId, CancellationToken cancellationToken = default)
        {
            if (!await IsActiveAdministratorAsync(actingUserId, cancellationToken))
                return new UserAdministrationOutcome(UserAdministrationResult.NotPermitted);

            var user = await _repo.Get().FirstOrDefaultAsync(x => x.PublicId == publicId && x.Name != SYSTEM_USER_NAME, cancellationToken);
            if (user == null)
                return new UserAdministrationOutcome(UserAdministrationResult.NotFound);

            if (user.IsActive)
                return new UserAdministrationOutcome(UserAdministrationResult.Done);

            user.IsActive = true;
            user.ModifiedByUserId = actingUserId;
            await _repo.UpdateAsync(user, true, cancellationToken);

            return new UserAdministrationOutcome(UserAdministrationResult.Done);
        }

        //Checked against the database rather than the caller's token, so an administrator who has since been demoted or
        //deactivated can't keep acting on a token that was issued while they still were one.
        private async Task<bool> IsActiveAdministratorAsync(int userId, CancellationToken cancellationToken)
        {
            return await _repo.AnyAsync(x => x.Id == userId && x.IsActive && x.Role == UserRole.Administrator, cancellationToken);
        }

        private async Task<bool> IsLastActiveAdministratorAsync(int userId, CancellationToken cancellationToken)
        {
            return !await _repo.AnyAsync(
                x => x.Id != userId && x.IsActive && x.Role == UserRole.Administrator && x.Name != SYSTEM_USER_NAME,
                cancellationToken);
        }

        private static string? ValidateProfile(string userName, string emailAddress, UserRole role)
        {
            if (string.IsNullOrWhiteSpace(userName))
                return "A user name is required.";

            if (string.Equals(userName.Trim(), SYSTEM_USER_NAME, StringComparison.OrdinalIgnoreCase))
                return "That user name is reserved.";

            if (string.IsNullOrWhiteSpace(emailAddress) || !System.Net.Mail.MailAddress.TryCreate(emailAddress.Trim(), out _))
                return "A valid email address is required.";

            if (!Enum.IsDefined(typeof(UserRole), role))
                return "The role must be Standard or Administrator.";

            return null;
        }

        private static string? ValidateSettings(UserSettingsUpdate settings)
        {
            if (settings == null)
                return "Settings are required.";

            if (settings.RepSettings == null || settings.RepSettings.Count > MAX_REP_SETTINGS)
                return $"At most {MAX_REP_SETTINGS} rep settings are allowed.";

            foreach (var repSetting in settings.RepSettings)
            {
                if (!Enum.IsDefined(typeof(SetType), repSetting.SetType))
                    return "A rep setting has an unknown set type.";

                if (repSetting.MinReps > repSetting.MaxReps)
                    return "A rep setting's minimum can't be greater than its maximum.";
            }

            return null;
        }
    }
}
