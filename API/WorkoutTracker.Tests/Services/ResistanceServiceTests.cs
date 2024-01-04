using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Services;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Resistances;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class ResistanceServiceTests
    {
        private ResistanceService _sut;
        private Mock<IResistanceBandService> _resistanceBandServiceMock;
        private Mock<ILogger<ResistanceService>> _loggerMock;

        [TestInitialize]
        public void Init()
        {
            _resistanceBandServiceMock = new Mock<IResistanceBandService>(MockBehavior.Strict);
            _loggerMock = new Mock<ILogger<ResistanceService>>(MockBehavior.Strict);
            _loggerMock.Setup(x => x.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()));

            _sut = new ResistanceService(_resistanceBandServiceMock.Object, _loggerMock.Object);
        }

        [TestMethod]
        public void Should_Get_Decreased_Resistance_Amount_For_MachineWeight_Exercise_With_Multiplier_Of_Negative_1()
        {
            string makeup = null;
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.MachineWeight, 30, -1, false, false, out makeup);
            Assert.AreEqual(20, result);
        }

        [TestMethod]
        public void Should_Get_Decreased_Resistance_Amount_For_MachineWeight_Exercise_With_Multiplier_Of_Negative_2()
        {
            string makeup = null;
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.MachineWeight, 30, -2, false, false, out makeup);
            Assert.AreEqual(10, result);
        }

        [TestMethod]
        public void Should_Get_Decreased_Resistance_Amount_For_ResistanceBand_Exercise_With_Multiplier_Of_Negative_1()
        {
            _resistanceBandServiceMock
                .Setup(x => x.GetLowestResistanceBand())
                .Returns(new ResistanceBand { Color = "Yellow", MaxResistanceAmount = 3 });

            _resistanceBandServiceMock
                .Setup(x =>
                    x.GetResistanceBandsForResistanceAmountRange(
                        It.IsAny<decimal>(),
                        It.IsAny<decimal>(),
                        It.IsAny<decimal>(),
                        It.IsAny<bool>(),
                        It.IsAny<bool>()))
                .Returns(new List<ResistanceBand> { new ResistanceBand { Color = "Purple", MaxResistanceAmount = 23 } });

            decimal currentResistanceAmount = 30;
            sbyte multiplier = -1;
            bool isDoubledBands = false;
            bool usesBilateralResistance = false;
            decimal expectedMinimalAdjustment = -3;
            decimal expectedMaximumAdjustment = -13;

            string makeup = null;
            
            var result = _sut.GetNewResistanceAmount(
                ResistanceType.ResistanceBand, 
                currentResistanceAmount, 
                multiplier, 
                isDoubledBands, 
                usesBilateralResistance,
                out makeup);
            
            Assert.AreEqual(23, result);
            _resistanceBandServiceMock.Verify(x => x.GetLowestResistanceBand(), Times.Once);
            _resistanceBandServiceMock.Verify(x => 
                x.GetResistanceBandsForResistanceAmountRange(
                    currentResistanceAmount, 
                    expectedMinimalAdjustment, 
                    expectedMaximumAdjustment, 
                    isDoubledBands,
                    usesBilateralResistance), 
                    Times.Once);
        }

        [TestMethod]
        public void Should_Get_Decreased_Resistance_Amount_For_ResistanceBand_Exercise_With_Multiplier_Of_Negative_2()
        {
            _resistanceBandServiceMock
                .Setup(x => x.GetLowestResistanceBand())
                .Returns(new ResistanceBand { Color = "Yellow", MaxResistanceAmount = 3 });

            _resistanceBandServiceMock
                .Setup(x =>
                    x.GetResistanceBandsForResistanceAmountRange(
                        It.IsAny<decimal>(),
                        It.IsAny<decimal>(),
                        It.IsAny<decimal>(),
                        It.IsAny<bool>(),
                        It.IsAny<bool>()))
                .Returns(new List<ResistanceBand> { new ResistanceBand { Color = "Purple", MaxResistanceAmount = 23 } });

            decimal currentResistanceAmount = 30;
            sbyte multiplier = -2;
            bool isDoubledBands = false;
            bool usesBilateralResistance = false;
            decimal expectedMinimalAdjustment = -6;
            decimal expectedMaximumAdjustment = -16;

            string makeup = null;

            var result = _sut.GetNewResistanceAmount(
                ResistanceType.ResistanceBand,
                currentResistanceAmount,
                multiplier,
                isDoubledBands,
                usesBilateralResistance,
                out makeup);

            Assert.AreEqual(23, result);
            _resistanceBandServiceMock.Verify(x => x.GetLowestResistanceBand(), Times.Once);
            _resistanceBandServiceMock.Verify(x =>
                x.GetResistanceBandsForResistanceAmountRange(
                    currentResistanceAmount,
                    expectedMinimalAdjustment,
                    expectedMaximumAdjustment,
                    isDoubledBands,
                    usesBilateralResistance),
                    Times.Once);
        }

        [TestMethod]
        public void Should_Get_Decreased_Resistance_Amount_For_ResistanceBand_Exercise_With_Bands_Doubled_Over()
        {
            _resistanceBandServiceMock
                .Setup(x => x.GetLowestResistanceBand())
                .Returns(new ResistanceBand { Color = "Yellow", MaxResistanceAmount = 3 });

            _resistanceBandServiceMock
                .Setup(x =>
                    x.GetResistanceBandsForResistanceAmountRange(
                        It.IsAny<decimal>(),
                        It.IsAny<decimal>(),
                        It.IsAny<decimal>(),
                        It.IsAny<bool>(),
                        It.IsAny<bool>()))
                .Returns(new List<ResistanceBand> { new ResistanceBand { Color = "Purple", MaxResistanceAmount = 23 } });

            decimal currentResistanceAmount = 30;
            sbyte multiplier = -2;
            bool isDoubledBands = true;
            bool usesBilateralResistance = false;
            decimal expectedMinimalAdjustment = -6;
            decimal expectedMaximumAdjustment = -16;

            string makeup = null;

            var result = _sut.GetNewResistanceAmount(
                ResistanceType.ResistanceBand,
                currentResistanceAmount,
                multiplier,
                isDoubledBands,
                usesBilateralResistance,
                out makeup);

            Assert.AreEqual(46, result);
            _resistanceBandServiceMock.Verify(x => x.GetLowestResistanceBand(), Times.Once);
            _resistanceBandServiceMock.Verify(x =>
                x.GetResistanceBandsForResistanceAmountRange(
                    currentResistanceAmount,
                    expectedMinimalAdjustment,
                    expectedMaximumAdjustment,
                    isDoubledBands, 
                    usesBilateralResistance),
                    Times.Once);
        }

        [TestMethod]
        public void Should_Get_Increased_Resistance_For_Bilateral_FreeWeight_Exercise_With_Multiplier_Of_1()
        {
            string makeup = null;
            //Assumes a free weight increment of 5 lbs. Bilaterally, that should add up to 10.
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.FreeWeight, 30, 1, false, true, out makeup);
            Assert.AreEqual(40, result);
        }

        [TestMethod]
        public void Should_Get_Decreased_Resistance_For_Bilateral_FreeWeight_Exercise_With_Multiplier_Of_Negative_1()
        {
            string makeup = null;
            //Assumes a free weight increment of 5 lbs. Bilaterally, that should add up to 10.
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.FreeWeight, 30, -1, false, true, out makeup);
            Assert.AreEqual(20, result);
        }

        [TestMethod]
        public void Should_Get_Increased_Resistance_For_Bilateral_FreeWeight_Exercise_With_Multiplier_Of_2()
        {
            string makeup = null;
            //Assumes a free weight increment of 5 lbs. Bilaterally, that should add up to 10.
            //Multiplier of 2 should give us a result of 50 (30 + (10 * 2)).
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.FreeWeight, 30, 2, false, true, out makeup);
            Assert.AreEqual(50, result);
        }

        [TestMethod]
        public void Should_Get_Decreased_Resistance_For_Bilateral_FreeWeight_Exercise_With_Multiplier_Of_Negative_2()
        {
            string makeup = null;
            //Assumes a free weight increment of 5 lbs. Bilaterally, that should add up to 10.
            //Multiplier of -2 should give us a result of 10 (30 - (10 * 2)).
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.FreeWeight, 30, -2, false, true, out makeup);
            Assert.AreEqual(10, result);
        }

        [TestMethod]
        public void Should_Get_Increased_Resistance_For_Bilateral_MachineWeight_Exercise_With_Multiplier_Of_1()
        {
            string makeup = null;
            //Assumes a machine weight increment of 10 lbs. Bilaterally, that should add up to 20.
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.MachineWeight, 30, 1, false, true, out makeup);
            Assert.AreEqual(50, result);
        }

        [TestMethod]
        public void Should_Get_Decreased_Resistance_For_Bilateral_MachineWeight_Exercise_With_Multiplier_Of_Negative_1()
        {
            string makeup = null;
            //Assumes a machine weight increment of 10 lbs. Bilaterally, that should add up to 20.
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.MachineWeight, 30, -1, false, true, out makeup);
            Assert.AreEqual(10, result);
        }

        [TestMethod]
        public void Should_Get_Increased_Resistance_For_Bilateral_MachineWeight_Exercise_With_Multiplier_Of_2()
        {
            string makeup = null;
            //Assumes a machine weight increment of 10 lbs. Bilaterally, that should add up to 20.
            //Multiplier of 2 should give us a result of 70 (30 + (20 * 2)).
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.MachineWeight, 30, 2, false, true, out makeup);
            Assert.AreEqual(70, result);
        }

        [TestMethod]
        public void Should_Get_Decreased_Resistance_For_Bilateral_MachineWeight_Exercise_With_Multiplier_Of_Negative_2()
        {
            string makeup = null;
            //Assumes a machine weight increment of 10 lbs. Bilaterally, that should add up to 20.
            //Multiplier of -2 should give us a result of -10 (30 - (20 * 2)).
            //Result should be the minimum resistance amount -- in this case, 10.
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.MachineWeight, 30, -2, false, true, out makeup);
            Assert.AreEqual(10, result);
        }
    }
}
