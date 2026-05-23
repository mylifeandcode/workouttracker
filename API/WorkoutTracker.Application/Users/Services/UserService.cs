using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Shared.BaseClasses;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Users.Services
{
    public class UserService : PublicEntityServiceBase<User>, IUserService, IDisposable
    {
        private ICryptoService _cryptoService;
        private IEmailService _emailService;
        private string _frontEndResetPasswordUrl;
        private bool _disposedValue;

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

        public async Task<User> AddAsync(User user)
        {
            if (!await _repo.AnyAsync(x => x.Name != "SYSTEM")) user.Role = UserRole.Administrator;
            return await AddAsync(user, true);
        }

        public override async Task DeleteAsync(int userId)
        {
            //TODO: Delete entities associated with user (workouts, etc)
            await base.DeleteAsync(userId);
        }

        public async Task<User> UpdateAsync(User user)
        {
            return await UpdateAsync(user, true);
        }

        public override async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _repo.Get().Where(x => x.Name.ToUpper() != "SYSTEM").ToListAsync();
        }

        public async Task<IEnumerable<User>> GetAllWithoutTrackingAsync()
        {
            return await _repo.GetWithoutTracking().Where(x => x.Name.ToUpper() != "SYSTEM").ToListAsync();
        }

        public async Task<User?> GetByPublicIdAsync(Guid publicId)
        {
            return await _repo.GetWithoutTracking().FirstOrDefaultAsync(x => x.PublicId == publicId);
        }

        public async Task ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            try
            {
                var user = await _repo.GetAsync(userId);

                if (user == null) throw new ApplicationException("User not found.");
                if (!_cryptoService.VerifyValuesMatch(currentPassword, user.HashedPassword, user.Salt))
                    throw new ApplicationException("Current password is not correct.");

                user.HashedPassword = _cryptoService.ComputeHash(newPassword, user.Salt);
                await _repo.UpdateAsync(user, true);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<string?> RequestPasswordResetAsync(string emailAddress)
        {
            var user = await _repo.Get().FirstOrDefaultAsync(x => x.EmailAddress == emailAddress);
            if (user == null)
                return null;

            user.PasswordResetCode = _cryptoService.GeneratePasswordResetCode();
            await _repo.UpdateAsync(user, true);

            if (_emailService.IsEnabled)
            {
                await _emailService.SendEmailAsync(
                    emailAddress,
                    "noreply@workouttracker.com",
                    "Password Reset",
                    $"A password reset request was received. If you made this request, please go to {_frontEndResetPasswordUrl}/{user.PasswordResetCode}"
                    );
            }

            return user.PasswordResetCode;
        }

        public async Task ResetPasswordAsync(string resetCode, string newPassword)
        {
            var user = await _repo.Get().FirstOrDefaultAsync(user => user.PasswordResetCode == resetCode);

            if (user == null)
                throw new ApplicationException($"No user found with password reset code {resetCode}.");

            user.HashedPassword = _cryptoService.ComputeHash(newPassword, user.Salt);
            user.PasswordResetCode = null;

            await _repo.UpdateAsync(user, true);
        }

        public async Task<bool> ValidatePasswordResetCodeAsync(string resetCode)
        {
            return await _repo.Get().AnyAsync(user => user.PasswordResetCode == resetCode);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposedValue)
            {
                if (disposing)
                {
                    // TODO: Dispose managed state (managed objects)
                }

                if (_emailService != null)
                    _emailService.Dispose();

                _disposedValue = true;
            }
        }

        ~UserService()
        {
            Dispose(disposing: false);
        }

        public void Dispose()
        {
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }
}
