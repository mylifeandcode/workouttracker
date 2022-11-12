using System;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.Application.Exercises.Services;
using WorkoutTracker.Domain.Exercises;
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
        public void Should_Get_Adjustment_Recommendation_For_Repetition_Set_Where_Form_Was_Bad()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 10,
                    SetType = SetType.Repetition,
                    FormRating = 3,
                    RangeOfMotionRating = 4,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });
            const sbyte EXPECTED_MODIFIER = -1;

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Form needs improvement.", recommendation.Reason, "Recommendation Reason isn't as expected.");
            Assert.AreEqual(13, recommendation.ResistanceAmount, "Recommendation ResistanceAmount isn't as expected."); //Pre-set fake value
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup, "Recommendation ResistanceMakeup isn't as expected."); //Pre-set fake value
            Assert.AreEqual(executedExercise.TargetRepCount, recommendation.Reps, "Recommendation Reps isn't as expected.");
            _resistanceServiceMock.Verify(x => 
                x.GetNewResistanceAmount(
                    executedExercise.Exercise.ResistanceType, 
                    executedExercise.ResistanceAmount, 
                    EXPECTED_MODIFIER, 
                    !executedExercise.Exercise.OneSided, 
                    out _makeup), Times.Once);
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Repetition_Set_Where_Form_Was_Awful()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 10,
                    SetType = SetType.Repetition,
                    FormRating = 2,
                    RangeOfMotionRating = 4,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });
            const sbyte EXPECTED_MODIFIER = -2;

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Form needs much improvement.", recommendation.Reason, "Recommendation Reason isn't as expected.");
            Assert.AreEqual(13, recommendation.ResistanceAmount, "Recommendation ResistanceAmount isn't as expected."); //Pre-set fake value
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup, "Recommendation ResistanceMakeup isn't as expected."); //Pre-set fake value
            _resistanceServiceMock.Verify(x =>
                x.GetNewResistanceAmount(
                    executedExercise.Exercise.ResistanceType,
                    executedExercise.ResistanceAmount,
                    EXPECTED_MODIFIER,
                    !executedExercise.Exercise.OneSided,
                    out _makeup), Times.Once);
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Repetition_Set_Where_Range_of_Motion_Was_Bad()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 10,
                    SetType = SetType.Repetition,
                    FormRating = 5,
                    RangeOfMotionRating = 3,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });
            const sbyte EXPECTED_MODIFIER = -1;

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Range of motion needs improvement.", recommendation.Reason, "Recommendation Reason isn't as expected.");
            Assert.AreEqual(13, recommendation.ResistanceAmount, "Recommendation ResistanceAmount isn't as expected.");
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup, "Recommendation ResistanceMakeup isn't as expected.");
            _resistanceServiceMock.Verify(x =>
                x.GetNewResistanceAmount(
                    executedExercise.Exercise.ResistanceType,
                    executedExercise.ResistanceAmount,
                    EXPECTED_MODIFIER,
                    !executedExercise.Exercise.OneSided,
                    out _makeup), Times.Once);
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Repetition_Set_Where_Range_of_Motion_Was_Awful()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 10,
                    SetType = SetType.Repetition,
                    FormRating = 5,
                    RangeOfMotionRating = 2,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });
            const sbyte EXPECTED_MODIFIER = -2;

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Range of motion needs much improvement.", recommendation.Reason, "Recommendation Reason isn't as expected.");
            Assert.AreEqual(13, recommendation.ResistanceAmount, "Recommendation ResistanceAmount isn't as expected.");
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup, "Recommendation ResistanceMakeup isn't as expected.");
            _resistanceServiceMock.Verify(x =>
                x.GetNewResistanceAmount(
                    executedExercise.Exercise.ResistanceType,
                    executedExercise.ResistanceAmount,
                    EXPECTED_MODIFIER,
                    !executedExercise.Exercise.OneSided,
                    out _makeup), Times.Once);
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Repetition_Set_Where_Actual_Rep_Count_Was_Bad_But_Not_Less_Than_Minimum()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 12,
                    ActualRepCount = 10,
                    SetType = SetType.Repetition,
                    FormRating = 5,
                    RangeOfMotionRating = 5,
                    ResistanceAmount = 19,
                    ResistanceMakeup = "Blue", 
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Average rep count less than target.", recommendation.Reason, "Recommendation Reason isn't as expected.");
            Assert.AreEqual(19, recommendation.ResistanceAmount, "Recommendation ResistanceAmount isn't as expected.");
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup, "Recommendation ResistanceMakeup isn't as expected.");
            _resistanceServiceMock.Verify(x =>
                x.GetNewResistanceAmount(
                    executedExercise.Exercise.ResistanceType,
                    executedExercise.ResistanceAmount,
                    It.IsAny<sbyte>(),
                    !executedExercise.Exercise.OneSided,
                    out _makeup), Times.Never);
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Repetition_Set_Where_Actual_Rep_Count_Was_Awful()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 6,
                    SetType = SetType.Repetition,
                    FormRating = 5,
                    RangeOfMotionRating = 5,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);
            const sbyte EXPECTED_MODIFIER = -2;

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Average rep count much less than target.", recommendation.Reason, "Recommendation Reason isn't as expected.");
            Assert.AreEqual(13, recommendation.ResistanceAmount, "Recommendation ResistanceAmount isn't as expected.");
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup, "Recommendation ResistanceMakeup isn't as expected.");
            _resistanceServiceMock.Verify(x =>
                x.GetNewResistanceAmount(
                    executedExercise.Exercise.ResistanceType,
                    executedExercise.ResistanceAmount,
                    EXPECTED_MODIFIER,
                    !executedExercise.Exercise.OneSided,
                    out _makeup), Times.Once);
        }

        [TestMethod]
        public void Should_Get_Adjustment_Recommendation_For_Repetition_Set_With_Multiple_Areas_For_Improvement()
        {
            //ARRANGE
            var executedExercise =
                new ExecutedExercise
                {
                    TargetRepCount = 10,
                    ActualRepCount = 6,
                    SetType = SetType.Repetition,
                    FormRating = 2,
                    RangeOfMotionRating = 2,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            var averages = new ExecutedExerciseAverages(new List<ExecutedExercise> { executedExercise });
            const sbyte EXPECTED_MODIFIER = -2;

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(averages, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Form needs much improvement. Range of motion needs much improvement. Average rep count much less than target.", recommendation.Reason, "Recommendation Reason isn't as expected.");
            Assert.AreEqual(13, recommendation.ResistanceAmount, "Recommendation ResistanceAmount isn't as expected.");
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup, "Recommendation ResistanceMakeup isn't as expected.");
            _resistanceServiceMock.Verify(x =>
                x.GetNewResistanceAmount(
                    executedExercise.Exercise.ResistanceType,
                    executedExercise.ResistanceAmount,
                    EXPECTED_MODIFIER,
                    !executedExercise.Exercise.OneSided,
                    out _makeup), Times.Once);
        }
    }
}
