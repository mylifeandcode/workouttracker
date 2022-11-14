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
        private string _makeup;
        private UserSettings _userSettings;

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
                        out _makeup))
                .Returns(100);

            _userSettings = UserSettings.GetDefault();

            _sut = new IncreaseRecommendationService(_resistanceServiceMock.Object);
        }

        [TestMethod]
        public void Should_Get_Increase_Recommendation_When_ActualReps_Exceeded_TargetReps()
        {
            //ARRANGE
            var executedExerciseAverages = GetExecutedExerciseAverages(6, 8, 19);

            //ACT
            var result = _sut.GetIncreaseRecommendation(executedExerciseAverages, _userSettings);

            //ASSERT
            Assert.IsNotNull(result, "Result is null.");
            Assert.AreEqual(executedExerciseAverages.AverageActualRepCount + 1, result.Reps, "Result Reps not as expected.");
            Assert.AreEqual(executedExerciseAverages.AverageResistanceAmount, result.ResistanceAmount, "Result ResistanceAmount not as expected.");
        }

        private ExecutedExerciseAverages GetExecutedExerciseAverages(byte targetReps, byte actualReps, decimal resistanceAmount)
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
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }, 
                    ExerciseId = 1
                };

            return new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });
        }
    }
}
