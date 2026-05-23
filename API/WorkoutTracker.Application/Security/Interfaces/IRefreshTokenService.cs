using System.Threading.Tasks;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Application.Security.Interfaces
{
    public interface IRefreshTokenService
    {
        Task<(string RawToken, RefreshToken Entity)> GenerateRefreshTokenAsync(int userId);
        Task<RefreshToken?> ValidateRefreshTokenAsync(string rawRefreshToken, int userId);
        Task<(string RawToken, RefreshToken Entity)> RevokeAndReplaceAsync(RefreshToken existingToken, int userId);
        Task RevokeByUserIdAsync(int userId);
    }
}
