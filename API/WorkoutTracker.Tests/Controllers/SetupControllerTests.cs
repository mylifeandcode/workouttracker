using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Shouldly;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.API.Controllers;
using WorkoutTracker.API.Models;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Users.Models;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class SetupControllerTests
    {
        private Mock<IUserSetupService> _userSetupServiceMock;
        private SetupController _sut;

        [TestInitialize]
        public void Initialize()
        {
            _userSetupServiceMock = new Mock<IUserSetupService>(MockBehavior.Strict);

            //ControllerBase.Problem() asks the request's services for a factory, and there are no request services here.
            var problemDetailsFactory = new Mock<ProblemDetailsFactory>();
            problemDetailsFactory
                .Setup(x => x.CreateProblemDetails(It.IsAny<HttpContext>(), It.IsAny<int?>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns((HttpContext _, int? statusCode, string title, string type, string detail, string instance) =>
                    new ProblemDetails { Status = statusCode, Detail = detail });

            _sut = new SetupController(_userSetupServiceMock.Object) { ProblemDetailsFactory = problemDetailsFactory.Object };
        }

        private static FirstAdminRequestDTO CreateRequest()
        {
            return new FirstAdminRequestDTO { UserName = "Alice", EmailAddress = "alice@here.com", Password = "a-long-enough-password", SetupCode = "CODE" };
        }

        private void SetupOutcome(FirstAdminOutcome outcome)
        {
            _userSetupServiceMock
                .Setup(x => x.CreateFirstAdministratorAsync("Alice", "alice@here.com", "a-long-enough-password", "CODE", It.IsAny<CancellationToken>()))
                .ReturnsAsync(outcome);
        }

        [TestMethod]
        [DataRow(true)]
        [DataRow(false)]
        public async Task Should_Report_Whether_Setup_Is_Required(bool required)
        {
            //ARRANGE
            _userSetupServiceMock.Setup(x => x.IsSetupRequiredAsync(It.IsAny<CancellationToken>())).ReturnsAsync(required);

            //ACT
            var result = await _sut.GetStatus();

            //ASSERT
            var ok = result.Result.ShouldBeOfType<OkObjectResult>();
            ok.Value.ShouldBeOfType<SetupStatusDTO>().SetupRequired.ShouldBe(required);
        }

        [TestMethod]
        public async Task Should_Return_No_Content_When_The_Administrator_Is_Created()
        {
            //ARRANGE
            SetupOutcome(new FirstAdminOutcome(FirstAdminStatus.Created));

            //ACT
            var result = await _sut.CreateFirstAdministrator(CreateRequest());

            //ASSERT
            result.ShouldBeOfType<NoContentResult>();
        }

        [TestMethod]
        public async Task Should_Return_Conflict_When_Setup_Is_Already_Complete()
        {
            //ARRANGE
            SetupOutcome(new FirstAdminOutcome(FirstAdminStatus.AlreadySetUp));

            //ACT
            var result = await _sut.CreateFirstAdministrator(CreateRequest());

            //ASSERT
            result.ShouldBeOfType<ObjectResult>().StatusCode.ShouldBe(StatusCodes.Status409Conflict);
        }

        [TestMethod]
        public async Task Should_Return_A_Generic_Bad_Request_For_A_Wrong_Code()
        {
            //ARRANGE
            SetupOutcome(new FirstAdminOutcome(FirstAdminStatus.InvalidCode));

            //ACT
            var result = await _sut.CreateFirstAdministrator(CreateRequest());

            //ASSERT
            var objectResult = result.ShouldBeOfType<ObjectResult>();
            objectResult.StatusCode.ShouldBe(StatusCodes.Status400BadRequest);
            objectResult.Value.ShouldBeOfType<ProblemDetails>().Detail.ShouldBe("The setup code is not valid.");
        }

        [TestMethod]
        public async Task Should_Return_Too_Many_Requests_When_Locked_Out()
        {
            //ARRANGE
            SetupOutcome(new FirstAdminOutcome(FirstAdminStatus.LockedOut));

            //ACT
            var result = await _sut.CreateFirstAdministrator(CreateRequest());

            //ASSERT
            result.ShouldBeOfType<ObjectResult>().StatusCode.ShouldBe(StatusCodes.Status429TooManyRequests);
        }

        [TestMethod]
        public async Task Should_Return_The_Validation_Message_For_Invalid_Input()
        {
            //ARRANGE
            SetupOutcome(new FirstAdminOutcome(FirstAdminStatus.InvalidInput, "The password must be at least 12 characters."));

            //ACT
            var result = await _sut.CreateFirstAdministrator(CreateRequest());

            //ASSERT
            var objectResult = result.ShouldBeOfType<ObjectResult>();
            objectResult.StatusCode.ShouldBe(StatusCodes.Status400BadRequest);
            objectResult.Value.ShouldBeOfType<ProblemDetails>().Detail.ShouldBe("The password must be at least 12 characters.");
        }

        [TestMethod]
        public void Should_Be_Anonymous()
        {
            //The setup endpoints exist precisely for when nobody can log in yet.
            typeof(SetupController).GetCustomAttributes(typeof(AllowAnonymousAttribute), true).Any().ShouldBeTrue();
        }
    }
}
