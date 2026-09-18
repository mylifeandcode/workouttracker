using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.API.Controllers;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Workouts.Models;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class AnalyticsControllerTests : UserAwareControllerTestsBase
    {
        [TestMethod]
        public async Task Should_Get_Executed_Workout_Metrics()
        {
            //ARRANGE
            var workoutPublicId = Guid.NewGuid();
            var metrics = new List<ExecutedWorkoutMetrics>();

            var analyticsSvc = new Mock<IAnalyticsService>(MockBehavior.Strict);
            analyticsSvc.Setup(x => x.GetExecutedWorkoutMetricsAsync(42, 5, default)).ReturnsAsync(metrics);

            var workoutSvc = new Mock<IWorkoutService>(MockBehavior.Strict);
            workoutSvc.Setup(x => x.GetIdByPublicIdAsync(workoutPublicId, default)).ReturnsAsync(42);

            var sut = new AnalyticsController(analyticsSvc.Object, workoutSvc.Object, LoggerFactory);

            //ACT
            var response = await sut.GetExecutedWorkoutMetrics(workoutPublicId);

            //ASSERT
            Assert.IsNotNull(response);
            Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
            Assert.AreSame(metrics, (response.Result as OkObjectResult).Value);
            analyticsSvc.Verify(x => x.GetExecutedWorkoutMetricsAsync(42, 5, default), Times.Once);
        }

        [TestMethod]
        public async Task Should_Return_NotFound_When_Workout_Does_Not_Exist()
        {
            //ARRANGE
            var workoutPublicId = Guid.NewGuid();

            var analyticsSvc = new Mock<IAnalyticsService>(MockBehavior.Strict);

            var workoutSvc = new Mock<IWorkoutService>(MockBehavior.Strict);
            workoutSvc.Setup(x => x.GetIdByPublicIdAsync(workoutPublicId, default)).ReturnsAsync((int?)null);

            var sut = new AnalyticsController(analyticsSvc.Object, workoutSvc.Object, LoggerFactory);

            //ACT
            var response = await sut.GetExecutedWorkoutMetrics(workoutPublicId);

            //ASSERT
            Assert.IsNotNull(response);
            Assert.IsInstanceOfType(response.Result, typeof(NotFoundObjectResult));
            analyticsSvc.Verify(x => x.GetExecutedWorkoutMetricsAsync(It.IsAny<int>(), It.IsAny<int>(), default), Times.Never);
        }
    }
}
