using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.Application.Exercises.Services;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Tests.Services
{
    //TODO: Clean these tests up a bit.

    [TestClass]
    public class AdjustmentRecommendationServiceTests
    {
        private Mock<IResistanceService> _resistanceServiceMock;
        private Mock<ILogger<AdjustmentRecommendationService>> _loggerMock;
        private UserSettings _userSettings;
        private AdjustmentRecommendationService _sut;
        private string _makeup = "Blue";

        [TestInitialize]
        public void Initialize()
        {
            _userSettings = UserSettings.GetDefault();

            _loggerMock = new Mock<ILogger<AdjustmentRecommendationService>>(MockBehavior.Strict);
            _loggerMock.Setup(x => x.Log(
                It.IsAny<LogLevel>(), 
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true), 
                It.IsAny<Exception>(), 
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()));

            _resistanceServiceMock = new Mock<IResistanceService>(MockBehavior.Strict);
            _resistanceServiceMock
                .Setup(x => x.GetNewResistanceAmount(
                    It.IsAny<ResistanceType>(),
                    It.IsAny<decimal>(),
                    It.IsAny<sbyte>(),
                    It.IsAny<bool>(), 
                    out _makeup))
                .Returns(13);

            _sut = new AdjustmentRecommendationService(_resistanceServiceMock.Object, _loggerMock.Object);
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Resistance_Band_Repetition_Set_Where_Form_Was_Bad()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 10,
                    SetType = SetType.Timed,
                    FormRating = 3,
                    RangeOfMotionRating = 4,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Form needs improvement.", recommendation.Reason);
            Assert.AreEqual(13, recommendation.ResistanceAmount); //Pre-set fake value
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup); //Pre-set fake value
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Resistance_Band_Repetition_Set_Where_Form_Was_Awful()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 10,
                    SetType = SetType.Timed,
                    FormRating = 2,
                    RangeOfMotionRating = 4,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Form needs much improvement.", recommendation.Reason);
            Assert.AreEqual(13, recommendation.ResistanceAmount); //Pre-set fake value
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup); //Pre-set fake value
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Resistance_Band_Repetition_Set_Where_Range_of_Motion_Was_Bad()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 10,
                    SetType = SetType.Timed,
                    FormRating = 5,
                    RangeOfMotionRating = 3,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Range of motion needs improvement.", recommendation.Reason);
            Assert.AreEqual(13, recommendation.ResistanceAmount);
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup);
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Resistance_Band_Repetition_Set_Where_Range_of_Motion_Was_Awful()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 10,
                    SetType = SetType.Timed,
                    FormRating = 5,
                    RangeOfMotionRating = 2,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Range of motion needs much improvement.", recommendation.Reason);
            Assert.AreEqual(13, recommendation.ResistanceAmount);
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup);
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Resistance_Band_Repetition_Set_Where_Actual_Rep_Count_Was_Bad()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 8,
                    SetType = SetType.Timed,
                    FormRating = 5,
                    RangeOfMotionRating = 5,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Average rep count less than target.", recommendation.Reason);
            Assert.AreEqual(13, recommendation.ResistanceAmount);
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup);
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Resistance_Band_Repetition_Set_Where_Actual_Rep_Count_Was_Awful()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 6,
                    SetType = SetType.Timed,
                    FormRating = 5,
                    RangeOfMotionRating = 5,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Average rep count much less than target.", recommendation.Reason);
            Assert.AreEqual(13, recommendation.ResistanceAmount);
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup);
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Resistance_Band_Repetition_Set_With_Multiple_Areas_For_Improvement()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 6,
                    SetType = SetType.Timed,
                    FormRating = 2,
                    RangeOfMotionRating = 2,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Form needs much improvement. Range of motion needs much improvement. Average rep count much less than target.", recommendation.Reason);
            Assert.AreEqual(13, recommendation.ResistanceAmount);
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup);
        }
    }
}
