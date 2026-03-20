using System.Threading.Tasks;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Application.Security.Interfaces
{
    public interface IRefreshTokenService
    {
        (string RawToken, RefreshToken Entity) GenerateRefreshToken(int userId);
        RefreshToken? ValidateRefreshToken(string rawRefreshToken, int userId);
        (string RawToken, RefreshToken Entity) RevokeAndReplace(RefreshToken existingToken, int userId);
        void RevokeByUserId(int userId);
    }
}
