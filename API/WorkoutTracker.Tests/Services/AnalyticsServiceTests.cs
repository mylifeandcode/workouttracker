using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Workouts.Services;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class AnalyticsServiceTests
    {
        [TestMethod]
        public async Task Should_Get_ExecutedWorkoutsSummary_With_All_TargetAreas_Represented()
        {
            //ARRANGE
            int userId = 42;

            var allTargetAreas = new List<TargetArea>
            {
                new TargetArea { Id = 1, Name = "Chest" },
                new TargetArea { Id = 2, Name = "Legs" },
                new TargetArea { Id = 3, Name = "Back" }
            };

            var workoutCountsByTargetArea = new List<TargetAreaWorkoutCount>
            {
                new TargetAreaWorkoutCount("Chest", 2),
                new TargetAreaWorkoutCount("Legs", 1)
            };

            var executedWorkoutService = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            executedWorkoutService.Setup(x => x.GetFirstStartDateTimeByUserAsync(userId)).ReturnsAsync(new System.DateTime(2024, 1, 1));
            executedWorkoutService.Setup(x => x.GetLoggedWorkoutCountByUserAsync(userId)).ReturnsAsync(2);

            var targetAreaService = new Mock<ITargetAreaService>(MockBehavior.Strict);
            targetAreaService.Setup(x => x.GetAllAsync()).ReturnsAsync(allTargetAreas);

            var analyticsRepository = new Mock<IAnalyticsRepository>(MockBehavior.Strict);
            analyticsRepository.Setup(x => x.GetWorkoutCountsByTargetAreaAsync(userId)).ReturnsAsync(workoutCountsByTargetArea);

            var sut = new AnalyticsService(executedWorkoutService.Object, targetAreaService.Object, analyticsRepository.Object);

            //ACT
            var result = await sut.GetExecutedWorkoutsSummaryAsync(userId);

            //ASSERT
            Assert.AreEqual(2, result.TotalLoggedWorkouts);
            Assert.AreEqual(new System.DateTime(2024, 1, 1), result.FirstLoggedWorkoutDateTime);

            Assert.AreEqual(3, result.TargetAreasWithWorkoutCounts.Count);
            Assert.AreEqual(2, result.TargetAreasWithWorkoutCounts["Chest"]);
            Assert.AreEqual(1, result.TargetAreasWithWorkoutCounts["Legs"]);
            Assert.AreEqual(0, result.TargetAreasWithWorkoutCounts["Back"]);

            analyticsRepository.Verify(x => x.GetWorkoutCountsByTargetAreaAsync(userId), Times.Once);
        }
    }
}
