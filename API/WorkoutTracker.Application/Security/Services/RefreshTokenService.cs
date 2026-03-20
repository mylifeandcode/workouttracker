using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
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

        public (string RawToken, RefreshToken Entity) GenerateRefreshToken(int userId)
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

            _refreshTokenRepo.Add(refreshToken, saveChanges: true);

            return (rawToken, refreshToken);
        }

        public RefreshToken? ValidateRefreshToken(string rawRefreshToken, int userId)
        {
            var tokenHash = ComputeSha256Hash(rawRefreshToken);
            var existingToken = _refreshTokenRepo.Get()
                .FirstOrDefault(x => x.TokenHash == tokenHash);

            if (existingToken == null)
                return null;

            // If the token has been revoked, this may indicate token theft.
            // Revoke all descendant tokens in the rotation chain.
            if (existingToken.IsRevoked)
            {
                RevokeDescendants(existingToken);
                return null;
            }

            if (existingToken.ExpiryDate < DateTime.UtcNow)
                return null;

            // Verify the refresh token belongs to this user
            if (existingToken.UserId != userId)
                return null;

            return existingToken;
        }

        public (string RawToken, RefreshToken Entity) RevokeAndReplace(RefreshToken existingToken, int userId)
        {
            // Revoke the old refresh token
            existingToken.IsRevoked = true;
            existingToken.ModifiedByUserId = userId;
            existingToken.ModifiedDateTime = DateTime.UtcNow;

            // Generate new refresh token
            var (newRawToken, newRefreshTokenEntity) = GenerateRefreshToken(userId);

            // Link old to new for rotation chain tracking
            existingToken.ReplacedByTokenId = newRefreshTokenEntity.Id;
            _refreshTokenRepo.Update(existingToken, saveChanges: true);

            return (newRawToken, newRefreshTokenEntity);
        }

        public void RevokeByUserId(int userId)
        {
            var tokens = _refreshTokenRepo.Get()
                .Where(x => x.UserId == userId && !x.IsRevoked)
                .ToList();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.ModifiedByUserId = userId;
                token.ModifiedDateTime = DateTime.UtcNow;
                _refreshTokenRepo.Update(token, saveChanges: false);
            }

            // Save all changes at once
            if (tokens.Count > 0)
                _refreshTokenRepo.Update(tokens[0], saveChanges: true);
        }

        private void RevokeDescendants(RefreshToken token)
        {
            if (token.ReplacedByTokenId == null)
                return;

            var childToken = _refreshTokenRepo.Get(token.ReplacedByTokenId.Value);
            if (childToken != null && !childToken.IsRevoked)
            {
                childToken.IsRevoked = true;
                childToken.ModifiedDateTime = DateTime.UtcNow;
                _refreshTokenRepo.Update(childToken, saveChanges: true);
                RevokeDescendants(childToken);
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
