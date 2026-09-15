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
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Users.Services
{
    public class UserService : PublicEntityServiceBase<User>, IUserService
    {
        private ICryptoService _cryptoService;
        private IEmailService _emailService;
        private string _frontEndResetPasswordUrl;

        public UserService(
            IRepository<User> repo,
            ICryptoService cryptoService,
            IEmailService emailService,
            ILogger<UserService> logger,
            string frontEndResetPasswordUrl) : base(repo, logger)
        {
            _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            if (!string.IsNullOrWhiteSpace(frontEndResetPasswordUrl))
                _frontEndResetPasswordUrl = frontEndResetPasswordUrl;
            else
                throw new ArgumentNullException(nameof(frontEndResetPasswordUrl));
            _logger.LogInformation("UserService constructed");
        }

        public async Task<User> AddAsync(User user, CancellationToken cancellationToken = default)
        {
            if (!await _repo.AnyAsync(x => x.Name != "SYSTEM", cancellationToken)) user.Role = UserRole.Administrator;
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
            var user = await _repo.Get().FirstOrDefaultAsync(x => x.EmailAddress == emailAddress, cancellationToken);
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
    }
}
