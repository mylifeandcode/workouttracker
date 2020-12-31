using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using WorkoutApplication.Domain.Users;
using WorkoutTracker.Application.Users;
using WorkoutTracker.UI.Controllers;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class UsersControllerTests
    {
        [TestMethod]
        public void Should_Get_All()
        {
            //ARRANGE
            var users = new List<User>(2) { new User(), new User() };
            var service = new Mock<IUserService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetAll()).Returns(users);
            var sut = new UsersController(service.Object);

            //ACT
            var result = sut.Get();

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(users, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.GetAll(), Times.Once);
        }

        [TestMethod]
        public void Should_Get_By_Id()
        {
            //ARRANGE
            var user = new User();
            var service = new Mock<IUserService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetById(It.IsAny<int>())).Returns(user);
            var sut = new UsersController(service.Object);

            //ACT
            var result = sut.Get(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(user, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.GetById(1), Times.Once);
        }

        [TestMethod]
        public void Should_Return_NotFound_From_GetById_When_Entity_Not_Found()
        {
            //ARRANGE
            User user = null;
            var service = new Mock<IUserService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetById(It.IsAny<int>())).Returns(user);
            var sut = new UsersController(service.Object);

            //ACT
            var result = sut.Get(2);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
            service.Verify(mock => mock.GetById(2), Times.Once);
        }

        [TestMethod]
        public void Should_Add()
        {
            //ARRANGE
            var user = new User();
            var service = new Mock<IUserService>(MockBehavior.Strict);
            service.Setup(mock => mock.Add(user)).Returns(user);
            var sut = new UsersController(service.Object);

            //ACT
            var result = sut.Post(user);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(user, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.Add(user), Times.Once);
        }

        [TestMethod]
        public void Should_Update()
        {
            //ARRANGE
            var user = new User();
            var service = new Mock<IUserService>(MockBehavior.Strict);
            service.Setup(mock => mock.Update(user)).Returns(user);
            var sut = new UsersController(service.Object);

            //ACT
            var result = sut.Put(5, user);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(user, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.Update(user), Times.Once);
        }

        [TestMethod]
        public void Should_Delete()
        {
            //ARRANGE
            var service = new Mock<IUserService>(MockBehavior.Strict);
            service.Setup(mock => mock.Delete(It.IsAny<int>()));
            var sut = new UsersController(service.Object);

            //ACT
            var result = sut.Delete(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            service.Verify(mock => mock.Delete(1), Times.Once);
        }
    }
}
