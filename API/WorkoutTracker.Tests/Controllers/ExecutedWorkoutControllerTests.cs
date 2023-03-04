using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using WorkoutTracker.API.Controllers;
using WorkoutTracker.API.Mappers;
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

        private IEnumerable<ExecutedWorkout> _inProgressWorkouts;

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
            var results = _sut.GetInProgress();

            //ASSERT
            CollectionAssert.AreEquivalent(_inProgressWorkouts, results);
            _executedWorkoutService.Verify(x => x.GetInProgress(Convert.ToInt32(USER_ID)), Times.Once);
        }

        private void SetupExecutedWorkoutServiceMock()
        {
            _executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            _inProgressWorkouts = new List<ExecutedWorkout>(0);
            _executedWorkoutService.Setup(x => x.GetInProgress(It.IsAny<int>())).Returns(_inProgressWorkouts);
        }

        private void SetupExecutedWorkoutDTOMapperMock()
        {
            _executedWorkoutDTOMapper = new Mock<IExecutedWorkoutDTOMapper>(MockBehavior.Strict);
        }

        private void SetupExecutedWorkoutSummaryDTOMapper()
        {
            _executedWorkoutSummaryDTOMapper = new Mock<IExecutedWorkoutSummaryDTOMapper>(MockBehavior.Strict);
        }
    }
}
