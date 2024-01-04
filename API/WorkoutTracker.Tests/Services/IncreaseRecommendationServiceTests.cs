using Castle.Core.Logging;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.Application.Exercises.Services;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class IncreaseRecommendationServiceTests
    {
        private IncreaseRecommendationService _sut;
        private Mock<IResistanceService> _resistanceServiceMock;
        private Mock<ILogger<IncreaseRecommendationService>> _loggerMock;
        private string _makeup;
        private UserSettings _userSettings;
        private const decimal EXPECTED_NEW_RESISTANCE_AMOUNT = 100;

        [TestInitialize]
        public void Init()
        {
            _resistanceServiceMock = new Mock<IResistanceService>(MockBehavior.Strict);
            _resistanceServiceMock
                .Setup(x => 
                    x.GetNewResistanceAmount(
                        It.IsAny<ResistanceType>(), 
                        It.IsAny<decimal>(), 
                        It.IsAny<sbyte>(), 
                        It.IsAny<bool>(), 
                        It.IsAny<bool>(),
                        out _makeup))
                .Returns(EXPECTED_NEW_RESISTANCE_AMOUNT);

            _userSettings = UserSettings.GetDefault();
            _loggerMock = new Mock<ILogger<IncreaseRecommendationService>>(MockBehavior.Strict);
            _loggerMock.Setup(x => x.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()));

            _sut = new IncreaseRecommendationService(_resistanceServiceMock.Object, _loggerMock.Object);
        }

        [TestMethod]
        public void Should_Get_Increase_Recommendation_When_ActualReps_Exceeded_TargetReps_But_Less_Than_Max()
        {
            //ARRANGE
            var executedExerciseAverages = GetExecutedExerciseAverages(10, 11, 19);

            //ACT
            var result = _sut.GetIncreaseRecommendation(executedExerciseAverages, _userSettings);

            //ASSERT
            Assert.IsNotNull(result, "Result is null.");
            Assert.AreEqual(executedExerciseAverages.AverageActualRepCount + 1, result.Reps, "Result Reps not as expected.");
            Assert.AreEqual(executedExerciseAverages.AverageResistanceAmount, result.ResistanceAmount, "Result ResistanceAmount not as expected.");
        }

        [TestMethod]
        public void Should_Get_Increase_Recommendation_For_BodyWeight_Exercise_When_ActualReps_Exceeded_TargetReps()
        {
            //ARRANGE
            var executedExerciseAverages = GetExecutedExerciseAverages(30, 30, 0, ResistanceType.BodyWeight);

            //ACT
            var result = _sut.GetIncreaseRecommendation(executedExerciseAverages, _userSettings);

            //ASSERT
            Assert.IsNotNull(result, "Result is null.");
            Assert.AreEqual(executedExerciseAverages.AverageActualRepCount + 1, result.Reps, "Result Reps not as expected.");
            Assert.AreEqual(executedExerciseAverages.AverageResistanceAmount, result.ResistanceAmount, "Result ResistanceAmount not as expected.");
        }

        [TestMethod]
        public void Should_Get_Increase_Recommendation_When_ActualReps_Exceeded_TargetReps_And_Greater_Than_Max()
        {
            //ARRANGE
            var executedExerciseAverages = GetExecutedExerciseAverages(10, 15, 19);

            //ACT
            var result = _sut.GetIncreaseRecommendation(executedExerciseAverages, _userSettings);

            //ASSERT
            var repSettings = _userSettings.RepSettings.First(x => x.SetType == SetType.Repetition);
            Assert.IsNotNull(result, "Result is null.");
            Assert.AreEqual(repSettings.MinReps, result.Reps, "Result Reps not as expected.");
            Assert.AreEqual(EXPECTED_NEW_RESISTANCE_AMOUNT, result.ResistanceAmount, "Result ResistanceAmount not as expected.");
        }

        [TestMethod]
        public void Should_Get_Increase_Recommendation_For_BodyWeigh_Exercise_When_ActualReps_Greatly_Exceeded_TargetReps()
        {
            //ARRANGE
            var executedExerciseAverages = GetExecutedExerciseAverages(30, 40, 0, ResistanceType.BodyWeight);

            //ACT
            var result = _sut.GetIncreaseRecommendation(executedExerciseAverages, _userSettings);

            //ASSERT
            var repSettings = _userSettings.RepSettings.First(x => x.SetType == SetType.Repetition);
            Assert.IsNotNull(result, "Result is null.");
            Assert.AreEqual(41, result.Reps, "Result Reps not as expected.");
            Assert.AreEqual(0, result.ResistanceAmount, "Result ResistanceAmount not as expected.");
        }

        private ExecutedExerciseAverages GetExecutedExerciseAverages(
            byte targetReps, 
            byte actualReps, 
            decimal resistanceAmount, 
            ResistanceType resistanceType = ResistanceType.ResistanceBand)
        {
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = targetReps,
                    ActualRepCount = actualReps,
                    SetType = SetType.Repetition,
                    FormRating = 4,
                    RangeOfMotionRating = 4,
                    ResistanceAmount = resistanceAmount,
                    ResistanceMakeup = "Some Value",
                    Exercise = new Exercise { ResistanceType = resistanceType }, 
                    ExerciseId = 1
                };

            return new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });
        }
    }
}
