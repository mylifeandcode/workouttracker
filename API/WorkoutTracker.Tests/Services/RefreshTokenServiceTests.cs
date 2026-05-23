using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security.Services;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class RefreshTokenServiceTests
    {
        private Mock<IRepository<RefreshToken>> _refreshTokenRepoMock;
        private IConfiguration _configuration;
        private RefreshTokenService _sut;

        [TestInitialize]
        public void Initialize()
        {
            _refreshTokenRepoMock = new Mock<IRepository<RefreshToken>>(MockBehavior.Strict);

            var configData = new Dictionary<string, string>
            {
                { "Jwt:RefreshTokenLifetimeDays", "7" }
            };
            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(configData)
                .Build();

            _sut = new RefreshTokenService(_refreshTokenRepoMock.Object, _configuration);
        }

        [TestMethod]
        public async Task Should_Generate_Refresh_Token()
        {
            //ARRANGE
            _refreshTokenRepoMock
                .Setup(x => x.AddAsync(It.IsAny<RefreshToken>(), true))
                .ReturnsAsync((RefreshToken t, bool _) => t);

            //ACT
            var (rawToken, entity) = await _sut.GenerateRefreshTokenAsync(1);

            //ASSERT
            Assert.IsNotNull(rawToken);
            Assert.IsFalse(string.IsNullOrWhiteSpace(rawToken));
            Assert.IsNotNull(entity);
            Assert.AreEqual(1, entity.UserId);
            Assert.AreEqual(1, entity.CreatedByUserId);
            Assert.IsFalse(entity.IsRevoked);
            Assert.IsFalse(string.IsNullOrWhiteSpace(entity.TokenHash));
            Assert.IsTrue(entity.ExpiryDate > DateTime.UtcNow);
            _refreshTokenRepoMock.Verify(x => x.AddAsync(It.IsAny<RefreshToken>(), true), Times.Once);
        }

        [TestMethod]
        public async Task Should_Validate_Refresh_Token_Successfully()
        {
            //ARRANGE
            var rawToken = "testRawToken123";
            var tokenHash = RefreshTokenService.ComputeSha256Hash(rawToken);
            var existingToken = new RefreshToken
            {
                Id = 1,
                TokenHash = tokenHash,
                UserId = 1,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            };

            _refreshTokenRepoMock
                .Setup(x => x.Get())
                .Returns(new List<RefreshToken> { existingToken }.AsAsyncQueryable());

            //ACT
            var result = await _sut.ValidateRefreshTokenAsync(rawToken, 1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.AreEqual(existingToken.Id, result.Id);
        }

        [TestMethod]
        public async Task Should_Return_Null_When_Token_Not_Found()
        {
            //ARRANGE
            _refreshTokenRepoMock
                .Setup(x => x.Get())
                .Returns(new List<RefreshToken>().AsAsyncQueryable());

            //ACT
            var result = await _sut.ValidateRefreshTokenAsync("nonexistentToken", 1);

            //ASSERT
            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task Should_Return_Null_When_Token_Is_Expired()
        {
            //ARRANGE
            var rawToken = "testRawToken123";
            var tokenHash = RefreshTokenService.ComputeSha256Hash(rawToken);
            var existingToken = new RefreshToken
            {
                Id = 1,
                TokenHash = tokenHash,
                UserId = 1,
                ExpiryDate = DateTime.UtcNow.AddDays(-1),
                IsRevoked = false
            };

            _refreshTokenRepoMock
                .Setup(x => x.Get())
                .Returns(new List<RefreshToken> { existingToken }.AsAsyncQueryable());

            //ACT
            var result = await _sut.ValidateRefreshTokenAsync(rawToken, 1);

            //ASSERT
            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task Should_Return_Null_And_Revoke_Descendants_When_Token_Is_Revoked()
        {
            //ARRANGE
            var rawToken = "testRawToken123";
            var tokenHash = RefreshTokenService.ComputeSha256Hash(rawToken);
            var childToken = new RefreshToken
            {
                Id = 2,
                TokenHash = "childHash",
                UserId = 1,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
                ReplacedByTokenId = null
            };
            var existingToken = new RefreshToken
            {
                Id = 1,
                TokenHash = tokenHash,
                UserId = 1,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = true,
                ReplacedByTokenId = 2
            };

            _refreshTokenRepoMock
                .Setup(x => x.Get())
                .Returns(new List<RefreshToken> { existingToken, childToken }.AsAsyncQueryable());

            _refreshTokenRepoMock
                .Setup(x => x.GetAsync(2))
                .ReturnsAsync(childToken);

            _refreshTokenRepoMock
                .Setup(x => x.UpdateAsync(It.IsAny<RefreshToken>(), true))
                .ReturnsAsync((RefreshToken t, bool _) => t);

            //ACT
            var result = await _sut.ValidateRefreshTokenAsync(rawToken, 1);

            //ASSERT
            Assert.IsNull(result);
            Assert.IsTrue(childToken.IsRevoked);
            _refreshTokenRepoMock.Verify(x => x.UpdateAsync(childToken, true), Times.Once);
        }

        [TestMethod]
        public async Task Should_Return_Null_When_Token_Belongs_To_Different_User()
        {
            //ARRANGE
            var rawToken = "testRawToken123";
            var tokenHash = RefreshTokenService.ComputeSha256Hash(rawToken);
            var existingToken = new RefreshToken
            {
                Id = 1,
                TokenHash = tokenHash,
                UserId = 2,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            };

            _refreshTokenRepoMock
                .Setup(x => x.Get())
                .Returns(new List<RefreshToken> { existingToken }.AsAsyncQueryable());

            //ACT
            var result = await _sut.ValidateRefreshTokenAsync(rawToken, 1);

            //ASSERT
            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task Should_Revoke_And_Replace_Token()
        {
            //ARRANGE
            var existingToken = new RefreshToken
            {
                Id = 1,
                TokenHash = "oldHash",
                UserId = 1,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            };

            _refreshTokenRepoMock
                .Setup(x => x.AddAsync(It.IsAny<RefreshToken>(), true))
                .ReturnsAsync((RefreshToken t, bool _) => { t.Id = 2; return t; });

            _refreshTokenRepoMock
                .Setup(x => x.UpdateAsync(It.IsAny<RefreshToken>(), true))
                .ReturnsAsync((RefreshToken t, bool _) => t);

            //ACT
            var (newRawToken, newEntity) = await _sut.RevokeAndReplaceAsync(existingToken, 1);

            //ASSERT
            Assert.IsTrue(existingToken.IsRevoked);
            Assert.IsNotNull(newRawToken);
            Assert.IsNotNull(newEntity);
            Assert.AreEqual(2, existingToken.ReplacedByTokenId);
            _refreshTokenRepoMock.Verify(x => x.AddAsync(It.IsAny<RefreshToken>(), true), Times.Once);
            _refreshTokenRepoMock.Verify(x => x.UpdateAsync(existingToken, true), Times.Once);
        }

        [TestMethod]
        public async Task Should_Revoke_All_Tokens_By_User_Id()
        {
            //ARRANGE
            var tokens = new List<RefreshToken>
            {
                new RefreshToken { Id = 1, UserId = 1, IsRevoked = false },
                new RefreshToken { Id = 2, UserId = 1, IsRevoked = false }
            };

            _refreshTokenRepoMock
                .Setup(x => x.Get())
                .Returns(tokens.AsAsyncQueryable());

            _refreshTokenRepoMock
                .Setup(x => x.UpdateAsync(It.IsAny<RefreshToken>(), false))
                .ReturnsAsync((RefreshToken t, bool _) => t);

            _refreshTokenRepoMock
                .Setup(x => x.UpdateAsync(It.IsAny<RefreshToken>(), true))
                .ReturnsAsync((RefreshToken t, bool _) => t);

            //ACT
            await _sut.RevokeByUserIdAsync(1);

            //ASSERT
            Assert.IsTrue(tokens.TrueForAll(t => t.IsRevoked));
            _refreshTokenRepoMock.Verify(x => x.UpdateAsync(It.IsAny<RefreshToken>(), false), Times.Exactly(2));
            _refreshTokenRepoMock.Verify(x => x.UpdateAsync(tokens[0], true), Times.Once);
        }
    }
}
