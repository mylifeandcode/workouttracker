using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using System.Reflection;
using WorkoutTracker.Application.Users.Models;
using System.Threading;
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
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper, LoggerFactory);

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
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper, LoggerFactory);

            SetupUser(sut);

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
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper, LoggerFactory);

            SetupUser(sut);

            //ACT
            var result = await sut.GetByPublicId(publicId);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
            userService.Verify(mock => mock.GetByPublicIdAsync(publicId), Times.Once);
        }

        [TestMethod]
        public async Task Should_Add()
        {
            //ARRANGE
            var userDTO = new UserNewDTO { UserName = "Someone", Role = UserRole.Standard };
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.AddAsync(It.IsAny<User>())).ReturnsAsync(new User());
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper, LoggerFactory);
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
        public async Task Should_Not_Add_A_User_With_An_Undefined_Role()
        {
            //ARRANGE
            var userDTO = new UserNewDTO { UserName = "Someone", Role = 0 };
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper, LoggerFactory);
            SetupUser(sut);

            //ACT
            var result = await sut.Post(userDTO);

            //ASSERT
            Assert.IsInstanceOfType(result.Result, typeof(BadRequestObjectResult));
            userService.Verify(mock => mock.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [TestMethod]
        [DataRow("SYSTEM")]
        [DataRow("system")]
        [DataRow(" System ")]
        public async Task Should_Not_Add_A_User_Named_After_The_Hidden_System_User(string userName)
        {
            //ARRANGE
            var userDTO = new UserNewDTO { UserName = userName, Role = UserRole.Standard };
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper, LoggerFactory);
            SetupUser(sut);

            //ACT
            var result = await sut.Post(userDTO);

            //ASSERT
            Assert.IsInstanceOfType(result.Result, typeof(BadRequestObjectResult));
            userService.Verify(mock => mock.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [TestMethod]
        public void Should_Only_Allow_Administrators_To_Add_Users()
        {
            //Regression guard for the review finding "anyone can register as an Administrator": this endpoint was once anonymous.
            var method = typeof(UsersController).GetMethod(nameof(UsersController.Post), new[] { typeof(UserNewDTO), typeof(CancellationToken) });

            Assert.IsNotNull(method);
            Assert.IsTrue(method.GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>().Any(x => x.Roles == "Administrator"));
            Assert.AreEqual(0, method.GetCustomAttributes(typeof(AllowAnonymousAttribute), true).Length);
            Assert.AreEqual(0, typeof(UsersController).GetCustomAttributes(typeof(AllowAnonymousAttribute), true).Length);
        }

        [TestMethod]
        public async Task Should_Forward_CancellationToken_Through_Post_Override_Chain()
        {
            //ARRANGE — this exercises UsersController.Post(UserNewDTO, CT) -> base.Post(user, false, CT)
            //(SimpleAPIControllerBase<User>.Post, virtual dispatch back into the override) ->
            //_service.AddAsync(value, CT). It's the highest-risk hop in the whole CancellationToken
            //rollout: forgetting to forward the token at either base.Post(...) call site compiles
            //cleanly and passes every other test, since nothing else observes cancellation.
            var cts = new CancellationTokenSource();
            var token = cts.Token;
            var userDTO = new UserNewDTO { UserName = "Someone", Role = UserRole.Standard };
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.AddAsync(It.IsAny<User>(), token)).ReturnsAsync(new User());
            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper, LoggerFactory);
            SetupUser(sut);

            //ACT
            var result = await sut.Post(userDTO, token);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            userService.Verify(mock => mock.AddAsync(It.IsAny<User>(), token), Times.Once);
        }

        //AUTHORIZATION OF THE USER ENDPOINTS ///////////////////////////////////////

        private const string STANDARD_USER_ID = "7";
        private static readonly Guid OTHER_USER_PUBLIC_ID = Guid.Parse("22222222-2222-2222-2222-222222222222");

        private UsersController CreateSut(Mock<IUserService> userService, string role = "Administrator", string userId = USER_ID)
        {
            //ControllerBase.Problem() asks the request's services for a factory, and there are none in a unit test.
            var problemDetailsFactory = new Mock<ProblemDetailsFactory>();
            problemDetailsFactory
                .Setup(x => x.CreateProblemDetails(It.IsAny<HttpContext>(), It.IsAny<int?>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns((HttpContext _, int? statusCode, string title, string type, string detail, string instance) =>
                    new ProblemDetails { Status = statusCode, Detail = detail });

            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            var sut = new UsersController(userService.Object, executedWorkoutService.Object, _cryptoServiceMock.Object, _userDTOMapper, LoggerFactory)
            {
                ProblemDetailsFactory = problemDetailsFactory.Object
            };
            SetupUser(sut, role, userId);
            return sut;
        }

        private static bool Requires(MethodInfo method, string role)
        {
            return method.GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>().Any(x => x.Roles == role);
        }

        [TestMethod]
        public void Should_Not_Expose_The_Inherited_Entity_Endpoints()
        {
            //Regression guard for the review finding on the inherited Get/Put/Delete: they took the whole User entity, were open
            //to any signed-in user, and a save wiped the password hash and salt.
            var cancellation = typeof(CancellationToken);
            var inherited = new[]
            {
                typeof(UsersController).GetMethod(nameof(UsersController.Get), new[] { typeof(int), cancellation }),
                typeof(UsersController).GetMethod(nameof(UsersController.Put), new[] { typeof(int), typeof(User), cancellation }),
                typeof(UsersController).GetMethod(nameof(UsersController.Delete), new[] { typeof(int), cancellation })
            };

            foreach (var method in inherited)
            {
                Assert.IsNotNull(method);
                Assert.AreEqual(1, method.GetCustomAttributes(typeof(NonActionAttribute), true).Length, $"{method.Name} should be [NonAction].");
            }
        }

        [TestMethod]
        public void Should_Only_Allow_Administrators_To_Edit_And_Deactivate_Users()
        {
            var cancellation = typeof(CancellationToken);

            Assert.IsTrue(Requires(typeof(UsersController).GetMethod(nameof(UsersController.UpdateUser), new[] { typeof(Guid), typeof(UserUpdateDTO), cancellation }), "Administrator"));
            Assert.IsTrue(Requires(typeof(UsersController).GetMethod(nameof(UsersController.Deactivate), new[] { typeof(Guid), cancellation }), "Administrator"));
            Assert.IsTrue(Requires(typeof(UsersController).GetMethod(nameof(UsersController.Reactivate), new[] { typeof(Guid), cancellation }), "Administrator"));
        }

        [TestMethod]
        public void Should_Let_Any_Signed_In_User_Update_Only_Their_Own_Settings()
        {
            var method = typeof(UsersController).GetMethod(nameof(UsersController.UpdateMySettings));

            Assert.IsNotNull(method);
            Assert.IsFalse(Requires(method, "Administrator"));
            Assert.AreEqual(0, method.GetCustomAttributes(typeof(AllowAnonymousAttribute), true).Length);
            Assert.IsFalse(method.GetParameters().Any(x => x.ParameterType == typeof(Guid) || x.ParameterType == typeof(int)),
                "The settings endpoint must not take a user id: the caller comes from the token.");
        }

        [TestMethod]
        public async Task Should_Let_A_User_Read_Themselves()
        {
            //ARRANGE
            var user = new User { Id = 7, PublicId = USER_PUBLIC_ID, Name = "Bob", EmailAddress = "bob@here.com", Role = UserRole.Standard };
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.GetByPublicIdAsync(USER_PUBLIC_ID, It.IsAny<CancellationToken>())).ReturnsAsync(user);
            var sut = CreateSut(userService, role: "Standard", userId: STANDARD_USER_ID);

            //ACT
            var result = await sut.GetByPublicId(USER_PUBLIC_ID);

            //ASSERT
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
        }

        [TestMethod]
        public async Task Should_Not_Let_A_Standard_User_Read_Someone_Else()
        {
            //ARRANGE
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            var sut = CreateSut(userService, role: "Standard", userId: STANDARD_USER_ID);

            //ACT
            var result = await sut.GetByPublicId(OTHER_USER_PUBLIC_ID);

            //ASSERT
            Assert.IsInstanceOfType(result.Result, typeof(ForbidResult));
            userService.Verify(mock => mock.GetByPublicIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [TestMethod]
        public async Task Should_Let_An_Administrator_Read_Anyone()
        {
            //ARRANGE
            var user = new User { Id = 9, PublicId = OTHER_USER_PUBLIC_ID, Name = "Carol", EmailAddress = "carol@here.com", Role = UserRole.Standard };
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.GetByPublicIdAsync(OTHER_USER_PUBLIC_ID, It.IsAny<CancellationToken>())).ReturnsAsync(user);
            var sut = CreateSut(userService);

            //ACT
            var result = await sut.GetByPublicId(OTHER_USER_PUBLIC_ID);

            //ASSERT
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
        }

        [TestMethod]
        public async Task Should_Update_A_Profile_As_The_Calling_Administrator()
        {
            //ARRANGE
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService
                .Setup(mock => mock.UpdateProfileAsync(OTHER_USER_PUBLIC_ID, "Carol", "carol@here.com", UserRole.Administrator, 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new UserAdministrationOutcome(UserAdministrationResult.Done));
            var sut = CreateSut(userService);

            //ACT
            var result = await sut.UpdateUser(OTHER_USER_PUBLIC_ID, new UserUpdateDTO { UserName = "Carol", EmailAddress = "carol@here.com", Role = UserRole.Administrator });

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            userService.VerifyAll();
        }

        [TestMethod]
        public async Task Should_Apply_Settings_To_The_Caller_And_Nobody_Else()
        {
            //ARRANGE
            UserSettingsUpdate captured = null;
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService
                .Setup(mock => mock.UpdateSettingsAsync(7, It.IsAny<UserSettingsUpdate>(), It.IsAny<CancellationToken>()))
                .Callback((int _, UserSettingsUpdate settings, CancellationToken __) => captured = settings)
                .ReturnsAsync(new UserAdministrationOutcome(UserAdministrationResult.Done));
            var sut = CreateSut(userService, role: "Standard", userId: STANDARD_USER_ID);
            var request = new UserSettingsUpdateDTO
            {
                RecommendationsEnabled = true,
                LowestAcceptableRating = 3,
                RepSettings = new List<UserRepSettingUpdateDTO> { new UserRepSettingUpdateDTO { Id = 4, SetType = SetType.Repetition, MinReps = 8, MaxReps = 12 } }
            };

            //ACT
            var result = await sut.UpdateMySettings(request);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            Assert.IsNotNull(captured);
            Assert.IsTrue(captured.RecommendationsEnabled);
            Assert.AreEqual((byte)3, captured.LowestAcceptableRating);
            Assert.AreEqual(1, captured.RepSettings.Count);
            Assert.AreEqual(4, captured.RepSettings[0].Id);
            Assert.AreEqual((byte)12, captured.RepSettings[0].MaxReps);
        }

        [TestMethod]
        public async Task Should_Deactivate_And_Reactivate_As_The_Calling_Administrator()
        {
            //ARRANGE
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            userService.Setup(mock => mock.DeactivateAsync(OTHER_USER_PUBLIC_ID, 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new UserAdministrationOutcome(UserAdministrationResult.Done));
            userService.Setup(mock => mock.ReactivateAsync(OTHER_USER_PUBLIC_ID, 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new UserAdministrationOutcome(UserAdministrationResult.Done));
            var sut = CreateSut(userService);

            //ACT & ASSERT
            Assert.IsInstanceOfType(await sut.Deactivate(OTHER_USER_PUBLIC_ID), typeof(NoContentResult));
            Assert.IsInstanceOfType(await sut.Reactivate(OTHER_USER_PUBLIC_ID), typeof(NoContentResult));
            userService.VerifyAll();
        }

        [TestMethod]
        public async Task Should_Map_Administration_Outcomes_To_Http_Results()
        {
            //ARRANGE
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            UserAdministrationOutcome outcome = null;
            userService.Setup(mock => mock.DeactivateAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(() => outcome);
            var sut = CreateSut(userService);

            //ACT & ASSERT
            outcome = new UserAdministrationOutcome(UserAdministrationResult.NotFound);
            Assert.IsInstanceOfType(await sut.Deactivate(OTHER_USER_PUBLIC_ID), typeof(NotFoundResult));

            outcome = new UserAdministrationOutcome(UserAdministrationResult.NotPermitted);
            Assert.IsInstanceOfType(await sut.Deactivate(OTHER_USER_PUBLIC_ID), typeof(ForbidResult));

            outcome = new UserAdministrationOutcome(UserAdministrationResult.InvalidInput, "Nope.");
            var invalid = await sut.Deactivate(OTHER_USER_PUBLIC_ID) as ObjectResult;
            Assert.AreEqual(StatusCodes.Status400BadRequest, invalid.StatusCode);

            foreach (var refusal in new[]
            {
                UserAdministrationResult.CannotDeactivateSelf,
                UserAdministrationResult.CannotDeactivateSystem,
                UserAdministrationResult.CannotRemoveLastAdministrator
            })
            {
                outcome = new UserAdministrationOutcome(refusal, "Refused.");
                var conflict = await sut.Deactivate(OTHER_USER_PUBLIC_ID) as ObjectResult;
                Assert.AreEqual(StatusCodes.Status409Conflict, conflict.StatusCode, refusal.ToString());
            }
        }
    }
}
