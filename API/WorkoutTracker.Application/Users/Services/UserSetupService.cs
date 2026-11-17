using Microsoft.Extensions.Logging;
using System;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Users.Models;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Users.Services
{
    public class UserSetupService : IUserSetupService
    {
        //EnsureSeedData creates a hidden SYSTEM user, so "no users" means "no user other than SYSTEM".
        private const string SYSTEM_USER_NAME = "SYSTEM";

        //Closes the check-then-insert race, so two simultaneous requests can't both create an administrator.
        //A process-wide lock is enough because there is a single API instance.
        private static readonly SemaphoreSlim _creationGate = new SemaphoreSlim(1, 1);

        private readonly IRepository<User> _userRepo;
        private readonly ICryptoService _cryptoService;
        private readonly ISetupCodeProvider _setupCodeProvider;
        private readonly ILogger<UserSetupService> _logger;

        public UserSetupService(
            IRepository<User> userRepo,
            ICryptoService cryptoService,
            ISetupCodeProvider setupCodeProvider,
            ILogger<UserSetupService> logger)
        {
            _userRepo = userRepo ?? throw new ArgumentNullException(nameof(userRepo));
            _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
            _setupCodeProvider = setupCodeProvider ?? throw new ArgumentNullException(nameof(setupCodeProvider));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> IsSetupRequiredAsync(CancellationToken cancellationToken = default)
        {
            var isRequired = !await AnyRealUserExistsAsync(cancellationToken);

            if (isRequired)
                _setupCodeProvider.EnsureActive();
            else
                _setupCodeProvider.Clear();

            return isRequired;
        }

        public async Task<FirstAdminOutcome> CreateFirstAdministratorAsync(
            string userName,
            string emailAddress,
            string password,
            string? setupCode,
            CancellationToken cancellationToken = default)
        {
            await _creationGate.WaitAsync(cancellationToken);

            try
            {
                if (await AnyRealUserExistsAsync(cancellationToken))
                    return new FirstAdminOutcome(FirstAdminStatus.AlreadySetUp);

                //Makes sure the operator has been shown a code even if nobody asked for the status first.
                _setupCodeProvider.EnsureActive();

                switch (_setupCodeProvider.Check(setupCode))
                {
                    case SetupCodeResult.Valid:
                        break;
                    case SetupCodeResult.LockedOut:
                        return new FirstAdminOutcome(FirstAdminStatus.LockedOut);
                    default:
                        return new FirstAdminOutcome(FirstAdminStatus.InvalidCode);
                }

                var validationMessage = Validate(userName, emailAddress, password);
                if (validationMessage != null)
                    return new FirstAdminOutcome(FirstAdminStatus.InvalidInput, validationMessage);

                var administrator = BuildAdministrator(userName, emailAddress, password);
                await _userRepo.AddAsync(administrator, true, cancellationToken);

                _setupCodeProvider.Clear();
                _logger.LogInformation("First administrator '{UserName}' created through initial setup.", administrator.Name);

                return new FirstAdminOutcome(FirstAdminStatus.Created);
            }
            finally
            {
                _creationGate.Release();
            }
        }

        private async Task<bool> AnyRealUserExistsAsync(CancellationToken cancellationToken)
        {
            return await _userRepo.AnyAsync(x => x.Name != SYSTEM_USER_NAME, cancellationToken);
        }

        private static string? Validate(string userName, string emailAddress, string password)
        {
            if (string.IsNullOrWhiteSpace(userName))
                return "A user name is required.";

            if (string.Equals(userName.Trim(), SYSTEM_USER_NAME, StringComparison.OrdinalIgnoreCase))
                return "That user name is reserved.";

            if (string.IsNullOrWhiteSpace(emailAddress) || !MailAddress.TryCreate(emailAddress.Trim(), out _))
                return "A valid email address is required.";

            return PasswordPolicy.Validate(password);
        }

        //Mirrors what UsersController builds for a new user, except that the role is fixed.
        private User BuildAdministrator(string userName, string emailAddress, string password)
        {
            var now = DateTime.Now;

            var user = new User
            {
                Name = userName.Trim(),
                EmailAddress = emailAddress.Trim(),
                Role = UserRole.Administrator,
                CreatedByUserId = 0,
                CreatedDateTime = now
            };

            user.Salt = _cryptoService.GenerateSalt();
            user.HashedPassword = _cryptoService.ComputeHash(password, user.Salt);

            user.Settings.CreatedByUserId = user.CreatedByUserId;
            user.Settings.CreatedDateTime = now;
            user.Settings.RepSettings = UserSettings.GetDefaultMinMaxRepsSettings();

            foreach (var repSetting in user.Settings.RepSettings)
            {
                repSetting.CreatedByUserId = user.CreatedByUserId;
                repSetting.CreatedDateTime = now;
            }

            return user;
        }
    }
}
