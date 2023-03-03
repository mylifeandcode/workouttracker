using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.API.Controllers;
using WorkoutTracker.API.Mappers;
using WorkoutTracker.Application.Workouts.Interfaces;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class WorkoutControllerTests : UserAwareControllerTestsBase
    {
        private Mock<IWorkoutService> _workoutService;
        private Mock<IWorkoutPlanService> _workoutPlanService;
        private Mock<IExecutedWorkoutService> _executedWorkoutService;
        private Mock<IWorkoutDTOMapper> _workoutDTOMapper;
        private WorkoutController _sut;

        [TestInitialize]
        public void Initialize()
        {
            SetupWorkoutServiceMock();
            SetupWorkoutPlanServiceMock();
            SetupExecutedWorkoutServiceMock();
            SetupWorkoutDTOMapperMock();
        }

        [TestMethod]
        public void Should_Get_In_Progress_Workouts()
        {
            //ARRANGE

            //ACT

            //ASSERT
        }

        private void SetupWorkoutServiceMock()
        {
            _workoutService = new Mock<IWorkoutService>(MockBehavior.Strict);
        }

        private void SetupWorkoutPlanServiceMock()
        {
            _workoutPlanService = new Mock<IWorkoutPlanService>(MockBehavior.Strict);
        }

        private void SetupExecutedWorkoutServiceMock()
        {
            _executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
        }

        private void SetupWorkoutDTOMapperMock()
        {
            _workoutDTOMapper = new Mock<IWorkoutDTOMapper>(MockBehavior.Strict);
        }
    }
}
