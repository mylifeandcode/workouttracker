using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Security.Services
{
    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly IRepository<RefreshToken> _refreshTokenRepo;
        private readonly int _refreshTokenLifetimeDays;

        public RefreshTokenService(
            IRepository<RefreshToken> refreshTokenRepo,
            IConfiguration configuration)
        {
            _refreshTokenRepo = refreshTokenRepo;
            _refreshTokenLifetimeDays = int.TryParse(configuration["Jwt:RefreshTokenLifetimeDays"], out var days) ? days : 7;
        }

        public async Task<(string RawToken, RefreshToken Entity)> GenerateRefreshTokenAsync(int userId)
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);

            var rawToken = Convert.ToBase64String(randomBytes);
            var tokenHash = ComputeSha256Hash(rawToken);

            var refreshToken = new RefreshToken
            {
                TokenHash = tokenHash,
                UserId = userId,
                ExpiryDate = DateTime.UtcNow.AddDays(_refreshTokenLifetimeDays),
                IsRevoked = false,
                CreatedByUserId = userId,
                CreatedDateTime = DateTime.UtcNow
            };

            await _refreshTokenRepo.AddAsync(refreshToken, saveChanges: true);

            return (rawToken, refreshToken);
        }

        public async Task<RefreshToken?> ValidateRefreshTokenAsync(string rawRefreshToken, int userId)
        {
            var tokenHash = ComputeSha256Hash(rawRefreshToken);
            var existingToken = await _refreshTokenRepo.Get()
                .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

            if (existingToken == null)
                return null;

            if (existingToken.IsRevoked)
            {
                await RevokeDescendantsAsync(existingToken);
                return null;
            }

            if (existingToken.ExpiryDate < DateTime.UtcNow)
                return null;

            if (existingToken.UserId != userId)
                return null;

            return existingToken;
        }

        public async Task<(string RawToken, RefreshToken Entity)> RevokeAndReplaceAsync(RefreshToken existingToken, int userId)
        {
            existingToken.IsRevoked = true;
            existingToken.ModifiedByUserId = userId;
            existingToken.ModifiedDateTime = DateTime.UtcNow;

            var (newRawToken, newRefreshTokenEntity) = await GenerateRefreshTokenAsync(userId);

            existingToken.ReplacedByTokenId = newRefreshTokenEntity.Id;
            await _refreshTokenRepo.UpdateAsync(existingToken, saveChanges: true);

            return (newRawToken, newRefreshTokenEntity);
        }

        public async Task RevokeByUserIdAsync(int userId)
        {
            var tokens = await _refreshTokenRepo.Get()
                .Where(x => x.UserId == userId && !x.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.ModifiedByUserId = userId;
                token.ModifiedDateTime = DateTime.UtcNow;
                await _refreshTokenRepo.UpdateAsync(token, saveChanges: false);
            }

            if (tokens.Count > 0)
                await _refreshTokenRepo.UpdateAsync(tokens[0], saveChanges: true);
        }

        private async Task RevokeDescendantsAsync(RefreshToken token)
        {
            if (token.ReplacedByTokenId == null)
                return;

            var childToken = await _refreshTokenRepo.GetAsync(token.ReplacedByTokenId.Value);
            if (childToken != null && !childToken.IsRevoked)
            {
                childToken.IsRevoked = true;
                childToken.ModifiedDateTime = DateTime.UtcNow;
                await _refreshTokenRepo.UpdateAsync(childToken, saveChanges: true);
                await RevokeDescendantsAsync(childToken);
            }
        }

        public static string ComputeSha256Hash(string rawValue)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawValue));
            var sb = new StringBuilder(64);
            foreach (var b in bytes)
                sb.Append(b.ToString("x2"));
            return sb.ToString();
        }
    }
}
