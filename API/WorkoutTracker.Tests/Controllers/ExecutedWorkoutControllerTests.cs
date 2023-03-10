using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
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
        public void Should_Get_In_Progress_Workouts()
        {
            //ARRANGE

            //ACT
            var result = _sut.GetInProgress();

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(_inProgressWorkouts.Count, (result as ActionResult<WorkoutTracker.API.Models.ExecutedWorkoutSummaryDTO[]>).Value.Length);
            _executedWorkoutService.Verify(x => x.GetInProgress(Convert.ToInt32(USER_ID)), Times.Once);
        }

        private void SetupExecutedWorkoutServiceMock()
        {
            _executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            _inProgressWorkouts = new List<ExecutedWorkout>(5);
            for (short x = 0; x < 5; x++)
            {
                _inProgressWorkouts.Add(new ExecutedWorkout());
            }
            _executedWorkoutService.Setup(x => x.GetInProgress(It.IsAny<int>())).Returns(_inProgressWorkouts);
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
                    0, "Sample Workout", 1, 
                    new DateTime(2023, 5, 6, 12, 0, 0), 
                    new DateTime(2023, 5, 6, 13, 0, 0), 
                    new DateTime(2023, 5, 6, 11, 58, 0), "Some notes"));
        }
    }
}
