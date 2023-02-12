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
using WorkoutTracker.Application.Exercises.Services;
using WorkoutTracker.Application.Resistances.Interfaces;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class ExerciseAmountRecommendationServiceTests
    {
        private ExerciseAmountRecommendationService _sut;
        private Mock<IResistanceBandService> _resistanceBandServiceMock;
        private Mock<IIncreaseRecommendationService> _increaseRecommendationServiceMock;
        private Mock<IAdjustmentRecommendationService> _adjustmentRecommendationServiceMock;
        private Mock<ILogger<ExerciseAmountRecommendationService>> _loggerMock;

        [TestInitialize]
        public void Init() 
        {
            _resistanceBandServiceMock = new Mock<IResistanceBandService>(MockBehavior.Strict);
            _increaseRecommendationServiceMock = new Mock<IIncreaseRecommendationService>(MockBehavior.Strict);
            _adjustmentRecommendationServiceMock = new Mock<IAdjustmentRecommendationService>(MockBehavior.Strict);
            _loggerMock = new Mock<ILogger<ExerciseAmountRecommendationService>>(MockBehavior.Strict);

            _sut = new ExerciseAmountRecommendationService(
                _resistanceBandServiceMock.Object, 
                _increaseRecommendationServiceMock.Object, 
                _adjustmentRecommendationServiceMock.Object,
                _loggerMock.Object);
        }
    }
}
