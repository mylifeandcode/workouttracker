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

        [TestInitialize]
        public void Init()
        {
            _resistanceBandServiceMock = new Mock<IResistanceBandService>(MockBehavior.Strict);
            _sut = new ResistanceService(_resistanceBandServiceMock.Object);
        }

        [TestMethod]
        public void Should_Get_Decreased_Resistance_Amount_For_MachineWeight_Exercise_With_Multiplier_Of_Negative_1()
        {
            string makeup = null;
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.MachineWeight, 30, -1, false, out makeup);
            Assert.AreEqual(20, result);
        }

        [TestMethod]
        public void Should_Get_Decreased_Resistance_Amount_For_MachineWeight_Exercise_With_Multiplier_Of_Negative_2()
        {
            string makeup = null;
            var result = _sut.GetNewResistanceAmount(Domain.Exercises.ResistanceType.MachineWeight, 30, -2, false, out makeup);
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
                        It.IsAny<bool>()))
                .Returns(new List<ResistanceBand> { new ResistanceBand { Color = "Purple", MaxResistanceAmount = 23 } });

            decimal currentResistanceAmount = 30;
            sbyte multiplier = -1;
            bool isDoubledBands = false;
            decimal expectedMinimalAdjustment = -3;
            decimal expectedMaximumAdjustment = -13;

            string makeup = null;
            
            var result = _sut.GetNewResistanceAmount(
                ResistanceType.ResistanceBand, 
                currentResistanceAmount, 
                multiplier, 
                isDoubledBands, 
                out makeup);
            
            Assert.AreEqual(23, result);
            _resistanceBandServiceMock.Verify(x => x.GetLowestResistanceBand(), Times.Once);
            _resistanceBandServiceMock.Verify(x => 
                x.GetResistanceBandsForResistanceAmountRange(
                    currentResistanceAmount, 
                    expectedMinimalAdjustment, 
                    expectedMaximumAdjustment, 
                    isDoubledBands), 
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
                        It.IsAny<bool>()))
                .Returns(new List<ResistanceBand> { new ResistanceBand { Color = "Purple", MaxResistanceAmount = 23 } });

            decimal currentResistanceAmount = 30;
            sbyte multiplier = -2;
            bool isDoubledBands = false;
            decimal expectedMinimalAdjustment = -6;
            decimal expectedMaximumAdjustment = -16;

            string makeup = null;

            var result = _sut.GetNewResistanceAmount(
                ResistanceType.ResistanceBand,
                currentResistanceAmount,
                multiplier,
                isDoubledBands,
                out makeup);

            Assert.AreEqual(23, result);
            _resistanceBandServiceMock.Verify(x => x.GetLowestResistanceBand(), Times.Once);
            _resistanceBandServiceMock.Verify(x =>
                x.GetResistanceBandsForResistanceAmountRange(
                    currentResistanceAmount,
                    expectedMinimalAdjustment,
                    expectedMaximumAdjustment,
                    isDoubledBands),
                    Times.Once);
        }
    }
}
