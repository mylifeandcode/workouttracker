using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Application.Security.Interfaces;
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
        public void Should_Generate_Refresh_Token()
        {
            //ARRANGE
            _refreshTokenRepoMock
                .Setup(x => x.Add(It.IsAny<RefreshToken>(), true))
                .Returns((RefreshToken t, bool _) => t);

            //ACT
            var (rawToken, entity) = _sut.GenerateRefreshToken(1);

            //ASSERT
            Assert.IsNotNull(rawToken);
            Assert.IsFalse(string.IsNullOrWhiteSpace(rawToken));
            Assert.IsNotNull(entity);
            Assert.AreEqual(1, entity.UserId);
            Assert.AreEqual(1, entity.CreatedByUserId);
            Assert.IsFalse(entity.IsRevoked);
            Assert.IsFalse(string.IsNullOrWhiteSpace(entity.TokenHash));
            Assert.IsTrue(entity.ExpiryDate > DateTime.UtcNow);
            _refreshTokenRepoMock.Verify(x => x.Add(It.IsAny<RefreshToken>(), true), Times.Once);
        }

        [TestMethod]
        public void Should_Validate_Refresh_Token_Successfully()
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
                .Returns(new List<RefreshToken> { existingToken }.AsQueryable());

            //ACT
            var result = _sut.ValidateRefreshToken(rawToken, 1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.AreEqual(existingToken.Id, result.Id);
        }

        [TestMethod]
        public void Should_Return_Null_When_Token_Not_Found()
        {
            //ARRANGE
            _refreshTokenRepoMock
                .Setup(x => x.Get())
                .Returns(new List<RefreshToken>().AsQueryable());

            //ACT
            var result = _sut.ValidateRefreshToken("nonexistentToken", 1);

            //ASSERT
            Assert.IsNull(result);
        }

        [TestMethod]
        public void Should_Return_Null_When_Token_Is_Expired()
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
                .Returns(new List<RefreshToken> { existingToken }.AsQueryable());

            //ACT
            var result = _sut.ValidateRefreshToken(rawToken, 1);

            //ASSERT
            Assert.IsNull(result);
        }

        [TestMethod]
        public void Should_Return_Null_And_Revoke_Descendants_When_Token_Is_Revoked()
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
                .Returns(new List<RefreshToken> { existingToken, childToken }.AsQueryable());

            _refreshTokenRepoMock
                .Setup(x => x.Get(2))
                .Returns(childToken);

            _refreshTokenRepoMock
                .Setup(x => x.Update(It.IsAny<RefreshToken>(), true))
                .Returns((RefreshToken t, bool _) => t);

            //ACT
            var result = _sut.ValidateRefreshToken(rawToken, 1);

            //ASSERT
            Assert.IsNull(result);
            Assert.IsTrue(childToken.IsRevoked);
            _refreshTokenRepoMock.Verify(x => x.Update(childToken, true), Times.Once);
        }

        [TestMethod]
        public void Should_Return_Null_When_Token_Belongs_To_Different_User()
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
                .Returns(new List<RefreshToken> { existingToken }.AsQueryable());

            //ACT
            var result = _sut.ValidateRefreshToken(rawToken, 1);

            //ASSERT
            Assert.IsNull(result);
        }

        [TestMethod]
        public void Should_Revoke_And_Replace_Token()
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
                .Setup(x => x.Add(It.IsAny<RefreshToken>(), true))
                .Returns((RefreshToken t, bool _) => { t.Id = 2; return t; });

            _refreshTokenRepoMock
                .Setup(x => x.Update(It.IsAny<RefreshToken>(), true))
                .Returns((RefreshToken t, bool _) => t);

            //ACT
            var (newRawToken, newEntity) = _sut.RevokeAndReplace(existingToken, 1);

            //ASSERT
            Assert.IsTrue(existingToken.IsRevoked);
            Assert.IsNotNull(newRawToken);
            Assert.IsNotNull(newEntity);
            Assert.AreEqual(2, existingToken.ReplacedByTokenId);
            _refreshTokenRepoMock.Verify(x => x.Add(It.IsAny<RefreshToken>(), true), Times.Once);
            _refreshTokenRepoMock.Verify(x => x.Update(existingToken, true), Times.Once);
        }

        [TestMethod]
        public void Should_Revoke_All_Tokens_By_User_Id()
        {
            //ARRANGE
            var tokens = new List<RefreshToken>
            {
                new RefreshToken { Id = 1, UserId = 1, IsRevoked = false },
                new RefreshToken { Id = 2, UserId = 1, IsRevoked = false }
            };

            _refreshTokenRepoMock
                .Setup(x => x.Get())
                .Returns(tokens.AsQueryable());

            _refreshTokenRepoMock
                .Setup(x => x.Update(It.IsAny<RefreshToken>(), false))
                .Returns((RefreshToken t, bool _) => t);

            _refreshTokenRepoMock
                .Setup(x => x.Update(It.IsAny<RefreshToken>(), true))
                .Returns((RefreshToken t, bool _) => t);

            //ACT
            _sut.RevokeByUserId(1);

            //ASSERT
            Assert.IsTrue(tokens.All(t => t.IsRevoked));
            _refreshTokenRepoMock.Verify(x => x.Update(It.IsAny<RefreshToken>(), false), Times.Exactly(2));
            _refreshTokenRepoMock.Verify(x => x.Update(tokens[0], true), Times.Once);
        }
    }
}
