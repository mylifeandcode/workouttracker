using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;
using Shouldly;
using WorkoutTracker.Application.Users.Services;
using WorkoutTracker.Application.Security.Interfaces;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class UserServiceTests
    {
        private Mock<ICryptoService> _cryptoServiceMock;

        [TestInitialize]
        public void Init()
        {
            _cryptoServiceMock = new Mock<ICryptoService>(MockBehavior.Strict);
            _cryptoServiceMock.Setup(x => x.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHash");
            _cryptoServiceMock.Setup(x => x.GenerateSalt()).Returns("someSalt");
            _cryptoServiceMock.Setup(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(true);
        }

        [TestMethod]
        public void Should_Add_User()
        {
            //ARRANGE
            var repoMock = new Mock<IRepository<User>>(MockBehavior.Strict);
            repoMock.Setup(mock => mock.Add(It.IsAny<User>(), true)).Returns((User user, bool save) => user);

            var sut = new UserService(repoMock.Object, _cryptoServiceMock.Object);
            var user = new User();

            //ACT
            var result = sut.Add(user);

            //ASSERT
            repoMock.Verify(mock => mock.Add(user, true), Times.Once);
            result.ShouldBeSameAs(user);
        }

        [TestMethod]
        public void Should_Delete_User()
        {
            //ARRANGE
            var repoMock = new Mock<IRepository<User>>(MockBehavior.Strict);
            repoMock.Setup(mock => mock.Delete(It.IsAny<int>()));

            var sut = new UserService(repoMock.Object, _cryptoServiceMock.Object);
            int userId = 100;

            //ACT
            sut.Delete(userId);

            //ASSERT
            repoMock.Verify(mock => mock.Delete(userId), Times.Once);
        }

        [TestMethod]
        public void Should_Update_User()
        {
            //ARRANGE
            var repoMock = new Mock<IRepository<User>>(MockBehavior.Strict);
            repoMock.Setup(mock => mock.Update(It.IsAny<User>(), true)).Returns((User user, bool save) => user);

            var sut = new UserService(repoMock.Object, _cryptoServiceMock.Object);
            var user = new User();

            //ACT
            var result = sut.Update(user);

            //ASSERT
            repoMock.Verify(mock => mock.Update(user, true), Times.Once);
            result.ShouldBeSameAs(user);
        }

        [TestMethod]
        public void Should_Get_All_Users_Excluding_SYSTEM_User()
        {
            //ARRANGE
            var users = new List<User>(3);
            users.Add(new User { Name = "Paul" });
            users.Add(new User { Name = "System" });
            users.Add(new User { Name = "Frank" });

            var repoMock = new Mock<IRepository<User>>(MockBehavior.Strict);
            repoMock.Setup(mock => mock.Get()).Returns(users.AsQueryable());

            var sut = new UserService(repoMock.Object, _cryptoServiceMock.Object);

            //ACT
            var results = sut.GetAll().ToList();

            //ASSERT
            results.Count.ShouldBe(users.Count - 1);
            results.Any(user =>
                    //user.Name.ToUpper(System.Globalization.CultureInfo.CurrentCulture) == "SYSTEM")
                    //EF doesn't like the culture stuff! :/                    
                    user.Name.ToUpper() == "SYSTEM")
                .ShouldBeFalse();
        }
    }
}
