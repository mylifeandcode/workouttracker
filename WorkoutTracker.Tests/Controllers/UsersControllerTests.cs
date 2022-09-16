using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.UI.Controllers;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.UI.Auth;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class UsersControllerTests : UserAwareControllerTestsBase
    {
        private Mock<ICryptoService> _cryptoServiceMock;

        [TestInitialize]
        public void Initialize()
        {
            _cryptoServiceMock = new Mock<ICryptoService>(MockBehavior.Strict);
            _cryptoServiceMock.Setup(mock => mock.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHashedValue");
            _cryptoServiceMock.Setup(mock => mock.GenerateSalt()).Returns("someSaltValue");
        }

        [TestMethod]
        public void Should_Get_All()
        {
            //ARRANGE
            var users = new List<User>(2) { new User { Id = 1 }, new User { Id = 2 } };
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.GetAll()).Returns(users);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object);

            //ACT
            var result = sut.Get();

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(users, (result.Result as OkObjectResult).Value);

            userService.Verify(mock => mock.GetAll(), Times.Once);
        }

        [TestMethod]
        public void Should_Get_By_Id()
        {
            //ARRANGE
            var user = new User();
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.GetById(It.IsAny<int>())).Returns(user);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object);

            //ACT
            var result = sut.Get(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(user, (result.Result as OkObjectResult).Value);
            userService.Verify(mock => mock.GetById(1), Times.Once);
        }

        [TestMethod]
        public void Should_Return_NotFound_From_GetById_When_Entity_Not_Found()
        {
            //ARRANGE
            User user = null;
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.GetById(It.IsAny<int>())).Returns(user);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object);

            //ACT
            var result = sut.Get(2);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
            userService.Verify(mock => mock.GetById(2), Times.Once);
        }

        [TestMethod]
        public void Should_Add()
        {
            //ARRANGE
            var userDTO = new UserNewDTO();
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.Add(It.IsAny<User>())).Returns(new User());
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object);
            SetupUser(sut);

            //ACT
            var result = sut.Post(userDTO);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.IsInstanceOfType((result.Result as OkObjectResult).Value, typeof(User));
            userService.Verify(mock => mock.Add(It.IsAny<User>()), Times.Once);
        }

        [TestMethod]
        public void Should_Update()
        {
            //ARRANGE
            var user = new User();
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.Update(user)).Returns(user);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object);
            SetupUser(sut);

            //ACT
            var result = sut.Put(5, user);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(user, (result.Result as OkObjectResult).Value);
            userService.Verify(mock => mock.Update(user), Times.Once);
        }

        [TestMethod]
        public void Should_Delete()
        {
            //ARRANGE
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.Delete(It.IsAny<int>()));
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object);

            //ACT
            var result = sut.Delete(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            userService.Verify(mock => mock.Delete(1), Times.Once);
        }
    }
}
