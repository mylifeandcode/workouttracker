using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Application.Security.Interfaces
{
    public interface IRefreshTokenService
    {
        Task<(string RawToken, RefreshToken Entity)> GenerateRefreshTokenAsync(int userId, CancellationToken cancellationToken = default);
        Task<RefreshToken?> ValidateRefreshTokenAsync(string rawRefreshToken, int userId, CancellationToken cancellationToken = default);
        Task<(string RawToken, RefreshToken Entity)> RevokeAndReplaceAsync(RefreshToken existingToken, int userId, CancellationToken cancellationToken = default);
        Task RevokeByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    }
}
