using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.API.Controllers;
using WorkoutTracker.API.Mappers;
using WorkoutTracker.API.Models;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class ExecutedWorkoutControllerTests : UserAwareControllerTestsBase
    {
        private Mock<IExecutedWorkoutService> _executedWorkoutService;
        private Mock<IExecutedWorkoutDTOMapper> _executedWorkoutDTOMapper;
        private Mock<IExecutedWorkoutSummaryDTOMapper> _executedWorkoutSummaryDTOMapper;

        private List<ExecutedWorkout> _inProgressWorkouts;
        private IEnumerable<ExecutedWorkoutSummaryDTO> _executedWorkoutSummaries;

        private ExecutedWorkoutController _sut;

        [TestInitialize]
        public void Initialize()
        {
            SetupExecutedWorkoutServiceMock();
            SetupExecutedWorkoutDTOMapperMock();
            SetupExecutedWorkoutSummaryDTOMapper();
            _sut = new ExecutedWorkoutController(
                _executedWorkoutService.Object,
                _executedWorkoutDTOMapper.Object,
                _executedWorkoutSummaryDTOMapper.Object);
            SetupUser(_sut);
        }

        [TestMethod]
        public async Task Should_Get_In_Progress_Workouts()
        {
            //ARRANGE

            //ACT
            var response = await _sut.GetInProgress();

            //ASSERT
            Assert.IsNotNull(response);
            Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
            var results = (response.Result as OkObjectResult).Value as ExecutedWorkoutSummaryDTO[];
            Assert.AreEqual(_inProgressWorkouts.Count, results.Length);
            _executedWorkoutService.Verify(x => x.GetInProgressAsync(Convert.ToInt32(USER_ID)), Times.Once);
        }

        [TestMethod]
        public async Task Should_Delete_Planned_Workouts()
        {
            //ARRANGE
            var publicId = Guid.NewGuid();

            //ACT
            var response = await _sut.DeletePlanned(publicId);

            //ASSERT
            Assert.IsNotNull(response);
            Assert.IsInstanceOfType(response, typeof(StatusCodeResult));
            Assert.AreEqual(200, (response as StatusCodeResult).StatusCode);
            _executedWorkoutService.Verify(x => x.DeletePlannedAsync(publicId), Times.Once);
        }

        #region Setup Methods
        private void SetupExecutedWorkoutServiceMock()
        {
            _executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            _inProgressWorkouts = new List<ExecutedWorkout>(5);
            for (short x = 0; x < 5; x++)
            {
                _inProgressWorkouts.Add(new ExecutedWorkout());
            }
            _executedWorkoutService.Setup(x => x.GetInProgressAsync(It.IsAny<int>())).ReturnsAsync(_inProgressWorkouts);
            _executedWorkoutService.Setup(x => x.DeletePlannedAsync(It.IsAny<Guid>())).Returns(Task.CompletedTask);
        }

        private void SetupExecutedWorkoutDTOMapperMock()
        {
            _executedWorkoutDTOMapper = new Mock<IExecutedWorkoutDTOMapper>(MockBehavior.Strict);
        }

        private void SetupExecutedWorkoutSummaryDTOMapper()
        {
            _executedWorkoutSummaryDTOMapper = new Mock<IExecutedWorkoutSummaryDTOMapper>(MockBehavior.Strict);
            _executedWorkoutSummaries = new List<ExecutedWorkoutSummaryDTO>(0);
            _executedWorkoutSummaryDTOMapper
                .Setup(x => x.MapFromExecutedWorkout(It.IsAny<ExecutedWorkout>()))
                .Returns(new ExecutedWorkoutSummaryDTO(
                    Guid.NewGuid(),
                    DateTime.Now,
                    null,
                    "Some Workout",
                    Guid.NewGuid(),
                    new DateTime(2023, 5, 6, 12, 0, 0),
                    new DateTime(2023, 5, 6, 13, 0, 0),
                    "Some notes"));
        }
        #endregion Setup Methods
    }
}
