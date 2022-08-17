using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.UI.Controllers;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.UI.Auth;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class UsersControllerTests : UserAwareControllerTestsBase
    {
        [TestMethod]
        public void Should_Get_All()
        {
            //ARRANGE
            var users = new List<User>(2) { new User { Id = 1 }, new User { Id = 2 } };
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.GetAll()).Returns(users);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var cryptoService = new Mock<ICryptoService>(MockBehavior.Strict);
            cryptoService.Setup(mock => mock.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHashedValue");
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, cryptoService.Object);

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
            var cryptoService = new Mock<ICryptoService>(MockBehavior.Strict);
            cryptoService.Setup(mock => mock.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHashedValue");
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, cryptoService.Object);

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
            var cryptoService = new Mock<ICryptoService>(MockBehavior.Strict);
            cryptoService.Setup(mock => mock.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHashedValue");
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, cryptoService.Object);

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
            var user = new User();
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.Add(user)).Returns(user);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var cryptoService = new Mock<ICryptoService>(MockBehavior.Strict);
            cryptoService.Setup(mock => mock.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHashedValue");
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, cryptoService.Object);
            SetupUser(sut);

            //ACT
            var result = sut.Post(user);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(user, (result.Result as OkObjectResult).Value);
            userService.Verify(mock => mock.Add(user), Times.Once);
        }

        [TestMethod]
        public void Should_Update()
        {
            //ARRANGE
            var user = new User();
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.Update(user)).Returns(user);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var cryptoService = new Mock<ICryptoService>(MockBehavior.Strict);
            cryptoService.Setup(mock => mock.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHashedValue");
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, cryptoService.Object);
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
            var cryptoService = new Mock<ICryptoService>(MockBehavior.Strict);
            cryptoService.Setup(mock => mock.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHashedValue");
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, cryptoService.Object);

            //ACT
            var result = sut.Delete(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            userService.Verify(mock => mock.Delete(1), Times.Once);
        }
    }
}
