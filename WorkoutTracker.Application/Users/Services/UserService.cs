using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;
using WorkoutTracker.Application.Shared.BaseClasses;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Shared.Interfaces;

namespace WorkoutTracker.Application.Users.Services
{
    public class UserService : ServiceBase<User>, IUserService, IDisposable
    {
        private ICryptoService _cryptoService;
        private IEmailService _emailService;
        private string _frontEndResetPasswordUrl;
        private bool _disposedValue;

        public UserService(
            IRepository<User> repo, 
            ICryptoService cryptoService, 
            IEmailService emailService, 
            string frontEndResetPasswordUrl) : base(repo) 
        {
            _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            if(!string.IsNullOrWhiteSpace(frontEndResetPasswordUrl))
                _frontEndResetPasswordUrl = frontEndResetPasswordUrl;
            else
                throw new ArgumentNullException(nameof(frontEndResetPasswordUrl));
        }

        public User Add(User user)
        {
            return Add(user, true);
        }

        public override void Delete(int userId)
        {
            //TODO: Delete entities associated with user (workouts, etc)
            base.Delete(userId);
        }

        public User Update(User user)
        {
            return Update(user, true);
        }

        public override IEnumerable<User> GetAll()
        {
            //return _repo.Get().Where(x => x.Name.ToUpper(System.Globalization.CultureInfo.CurrentCulture) != "SYSTEM");
            //TODO: Revisit this query based on the error below.
            /*
            The version above doesn't translate.
            Exception is "InvalidOperationException: 
            The LINQ expression 'DbSet<User> .Where(u => u.Name.ToUpper(__CurrentCulture_0) != "SYSTEM")' 
            could not be translated. Either rewrite the query in a form that can be translated, or switch to 
            client evaluation explicitly by inserting a call to either AsEnumerable(), AsAsyncEnumerable(), 
            ToList(), or ToListAsync(). See https://go.microsoft.com/fwlink/?linkid=2101038 for more information."
            */
            return _repo.Get().Where(x => x.Name.ToUpper() != "SYSTEM");
        }

        public void ChangePassword(int userId, string currentPassword, string newPassword)
        {
            try
            {
                var user = _repo.Get(userId);
                
                if (user == null) throw new ApplicationException("User not found.");
                if (!_cryptoService.VerifyValuesMatch(currentPassword, user.HashedPassword, user.Salt))
                    throw new ApplicationException("Current password is not correct.");
                
                user.HashedPassword = _cryptoService.ComputeHash(newPassword, user.Salt);
                _repo.Update(user, true);
            }
            catch (Exception ex)
            {
                //TODO: Log
                throw;
            }
        }

        public string RequestPasswordReset(string emailAddress)
        {
            var user = _repo.Get().FirstOrDefault(x => x.EmailAddress == emailAddress);
            if (user == null)
                return null; //No user found. Don't throw an exception. If this was a malicious attempt, we don't want to provide useful information.

            user.PasswordResetCode = _cryptoService.GeneratePasswordResetCode();
            _repo.Update(user, true);

            if (_emailService.IsEnabled)
            { 
                _emailService.SendEmail(
                    emailAddress,
                    "noreply@workouttracker.com", //TODO: Make configurable
                    "Password Reset",
                    $"A password reset request was received. If you made this request, please go to {_frontEndResetPasswordUrl}/{user.PasswordResetCode}"
                    );
            }

            return user.PasswordResetCode;
        }

        public void ResetPassword(string resetCode, string newPassword)
        {
            var user = _repo.Get().FirstOrDefault(user => user.PasswordResetCode == resetCode);
            
            if (user == null)
                throw new ApplicationException($"No user found with password reset code {resetCode}.");

            user.HashedPassword = _cryptoService.ComputeHash(newPassword, user.Salt);
            user.PasswordResetCode = null;

            _repo.Update(user, true);
        }

        public bool ValidatePasswordResetCode(string resetCode)
        {
            return _repo.Get().Any(user => user.PasswordResetCode == resetCode);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposedValue)
            {
                if (disposing)
                {
                    // TODO: Dispose managed state (managed objects)
                }

                // Free unmanaged resources (unmanaged objects) and override finalizer
                if (_emailService != null)
                    _emailService.Dispose();

                // TODO: set large fields to null
                _disposedValue = true;
            }
        }

        // override finalizer only if 'Dispose(bool disposing)' has code to free unmanaged resources
        ~UserService()
        {
            // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
            Dispose(disposing: false);
        }

        public void Dispose()
        {
            // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }
}
