using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.API.Controllers;
using WorkoutTracker.API.Mappers;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.API.Models;
using System;
using System.Linq;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class UsersControllerTests : UserAwareControllerTestsBase
    {
        private Mock<ICryptoService> _cryptoServiceMock;
        private IUserDTOMapper _userDTOMapper;

        [TestInitialize]
        public void Initialize()
        {
            _cryptoServiceMock = new Mock<ICryptoService>(MockBehavior.Strict);
            _cryptoServiceMock.Setup(mock => mock.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHashedValue");
            _cryptoServiceMock.Setup(mock => mock.GenerateSalt()).Returns("someSaltValue");
            _userDTOMapper = new UserDTOMapper();
        }

        [TestMethod]
        public async Task Should_Get_All()
        {
            //ARRANGE
            var users = new List<User>(2) { new User { Id = 1, Name = "Alice" }, new User { Id = 2, Name = "Bob" } };
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.GetAllWithoutTrackingAsync()).ReturnsAsync(users);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper);

            //ACT
            var result = await sut.Get();

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var summaries = ((result.Result as OkObjectResult).Value as IEnumerable<UserSummaryDTO>).ToList();
            Assert.AreEqual(2, summaries.Count);
            Assert.AreEqual(users[0].Id, summaries[0].Id);
            Assert.AreEqual(users[0].Name, summaries[0].Name);
            Assert.AreEqual(users[1].Id, summaries[1].Id);
            Assert.AreEqual(users[1].Name, summaries[1].Name);

            userService.Verify(mock => mock.GetAllWithoutTrackingAsync(), Times.Once);
        }

        [TestMethod]
        public async Task Should_Get_By_Public_Id()
        {
            //ARRANGE
            var publicId = Guid.NewGuid();
            var user = new User
            {
                Id = 1,
                PublicId = publicId,
                Name = "Alice",
                EmailAddress = "alice@here.com",
                Role = UserRole.Standard,
                HashedPassword = "someHash"
            };
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.GetByPublicIdAsync(publicId)).ReturnsAsync(user);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper);

            //ACT
            var result = await sut.GetByPublicId(publicId);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var dto = (result.Result as OkObjectResult).Value as UserDTO;
            Assert.IsNotNull(dto);
            Assert.AreEqual(user.Id, dto.Id);
            Assert.AreEqual(user.PublicId, dto.PublicId);
            Assert.AreEqual(user.Name, dto.Name);
            Assert.AreEqual(user.EmailAddress, dto.EmailAddress);
            Assert.AreEqual(user.Role, dto.Role);

            userService.Verify(mock => mock.GetByPublicIdAsync(publicId), Times.Once);
        }

        [TestMethod]
        public async Task Should_Return_NotFound_From_GetByPublicId_When_Entity_Not_Found()
        {
            //ARRANGE
            var publicId = Guid.NewGuid();
            User user = null;
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.GetByPublicIdAsync(publicId)).ReturnsAsync(user);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper);

            //ACT
            var result = await sut.GetByPublicId(publicId);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
            userService.Verify(mock => mock.GetByPublicIdAsync(publicId), Times.Once);
        }

        [TestMethod]
        public async Task Should_Get_By_Id()
        {
            //ARRANGE
            var user = new User();
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(user);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper);

            //ACT
            var result = await sut.Get(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(user, (result.Result as OkObjectResult).Value);
            userService.Verify(mock => mock.GetByIdAsync(1), Times.Once);
        }

        [TestMethod]
        public async Task Should_Return_NotFound_From_GetById_When_Entity_Not_Found()
        {
            //ARRANGE
            User user = null;
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(user);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper);

            //ACT
            var result = await sut.Get(2);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
            userService.Verify(mock => mock.GetByIdAsync(2), Times.Once);
        }

        [TestMethod]
        public async Task Should_Add()
        {
            //ARRANGE
            var userDTO = new UserNewDTO();
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.AddAsync(It.IsAny<User>())).ReturnsAsync(new User());
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper);
            SetupUser(sut);

            //ACT
            var result = await sut.Post(userDTO);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.IsInstanceOfType((result.Result as OkObjectResult).Value, typeof(User));
            userService.Verify(mock => mock.AddAsync(It.IsAny<User>()), Times.Once);
        }

        [TestMethod]
        public async Task Should_Update()
        {
            //ARRANGE
            var user = new User();
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.UpdateAsync(user)).ReturnsAsync(user);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper);
            SetupUser(sut);

            //ACT
            var result = await sut.Put(5, user);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(user, (result.Result as OkObjectResult).Value);
            userService.Verify(mock => mock.UpdateAsync(user), Times.Once);
        }

        [TestMethod]
        public async Task Should_Delete()
        {
            //ARRANGE
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.DeleteAsync(It.IsAny<int>())).Returns(Task.CompletedTask);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper);

            //ACT
            var result = await sut.Delete(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            userService.Verify(mock => mock.DeleteAsync(1), Times.Once);
        }
    }
}
