using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Services;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class AdjustmentRecommendationServiceTests
    {
        private Mock<IResistanceBandService> _resistanceBandServiceMock;
        private Mock<IResistanceService> _resistanceServiceMock;
        private UserSettings _userSettings;
        private AdjustmentRecommendationService _sut;

        [TestInitialize]
        public void Initialize()
        {
            _resistanceBandServiceMock = new Mock<IResistanceBandService>(MockBehavior.Strict);
            
            _resistanceBandServiceMock
                .Setup(x => x.GetLowestResistanceBand())
                .Returns(new ResistanceBand{ Color = "Yellow", MaxResistanceAmount = 6 });
            
            _resistanceBandServiceMock
                .Setup(x => x.GetResistanceBandsForResistanceAmountRange(It.IsAny<decimal>(), It.IsAny<decimal>(), It.IsAny<decimal>(), It.IsAny<bool>()))
                .Returns(new List<ResistanceBand>(1) 
                    {
                        new ResistanceBand{ Color = "Blue", MaxResistanceAmount = 13 } 
                    });

            _userSettings = new UserSettings();

            _resistanceServiceMock = new Mock<IResistanceService>(MockBehavior.Strict);

            _sut = new AdjustmentRecommendationService(_resistanceBandServiceMock.Object, _resistanceServiceMock.Object);
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

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(executedExercise, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Form needs improvement.", recommendation.Reason);
            Assert.AreEqual(13, recommendation.ResistanceAmount);
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup);
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
                    RangeOfMotionRating = 2,
                    ResistanceAmount = 19,
                    Exercise = new Exercise { ResistanceType = ResistanceType.ResistanceBand }
                };

            //ACT
            var recommendation = _sut.GetAdjustmentRecommendation(executedExercise, _userSettings);

            //ASSERT
            Assert.IsNotNull(recommendation);
            Assert.AreEqual("Range of Motion needs improvement.", recommendation.Reason);
            Assert.AreEqual(13, recommendation.ResistanceAmount);
            Assert.AreEqual("Blue", recommendation.ResistanceMakeup);
        }
        
    }
}
