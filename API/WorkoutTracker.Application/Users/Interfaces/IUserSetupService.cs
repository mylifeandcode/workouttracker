using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Users.Models;

namespace WorkoutTracker.Application.Users.Interfaces
{
    public interface IUserSetupService
    {
        /// <summary>
        /// True while no user other than the hidden SYSTEM user exists. When it is, a setup code is made active
        /// (and announced on the API console) so the first administrator can be created.
        /// </summary>
        Task<bool> IsSetupRequiredAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Creates the first administrator. Works only while <see cref="IsSetupRequiredAsync"/> is true
        /// and only with the current setup code.
        /// </summary>
        Task<FirstAdminOutcome> CreateFirstAdministratorAsync(
            string userName,
            string emailAddress,
            string password,
            string? setupCode,
            CancellationToken cancellationToken = default);
    }
}
