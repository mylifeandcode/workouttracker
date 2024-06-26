﻿using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using WorkoutTracker.Repository;
using Shouldly;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Application.Resistances;
using WorkoutTracker.Application.Resistances.Services;
using Castle.Core.Logging;
using Microsoft.Extensions.Logging;
using System;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class ResistanceBandServiceTests
    {
        private Mock<IRepository<ResistanceBand>> _repo;
        private Mock<ILogger<ResistanceBandService>> _logger;
        private List<ResistanceBand> _bands;
        private ResistanceBandService _sut;

        [TestInitialize]
        public void Init()
        {
            SetupRepoMock();
            _logger = new Mock<ILogger<ResistanceBandService>>(MockBehavior.Strict);
            _logger.Setup(x => x.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()));

            _sut = new ResistanceBandService(_repo.Object, _logger.Object);
        }

        [TestMethod]
        public void Should_Add()
        {
            //ARRANGE
            var resistanceBand = new ResistanceBand();

            //ACT
            var result = _sut.Add(resistanceBand);

            //ASSERT
            _repo.Verify(mock => mock.Add(resistanceBand, true), Times.Once);
            result.ShouldBeSameAs(resistanceBand);
        }

        [TestMethod]
        public void Should_Delete()
        {
            //ARRANGE
            int resistanceBandId = 5;

            //ACT
            _sut.Delete(resistanceBandId);

            //ASSERT
            _repo.Verify(mock => mock.Delete(resistanceBandId), Times.Once);
        }

        [TestMethod]
        public void Should_Update()
        {
            //ARRANGE
            var resistanceBand = new ResistanceBand();

            //ACT
            var result = _sut.Update(resistanceBand);

            //ASSERT
            _repo.Verify(mock => mock.Update(resistanceBand, true), Times.Once);
            result.ShouldBeSameAs(resistanceBand);
        }

        [TestMethod]
        public void Should_Get_All()
        {
            //ARRANGE
            var resistanceBands = new List<ResistanceBand>(3);
            resistanceBands.Add(new ResistanceBand { Color = "Orange", MaxResistanceAmount = 30 });
            resistanceBands.Add(new ResistanceBand { Color = "Purple", MaxResistanceAmount = 23 });
            resistanceBands.Add(new ResistanceBand { Color = "Black", MaxResistanceAmount = 19 });

            _repo.Setup(mock => mock.Get()).Returns(resistanceBands.AsQueryable());

            //ACT
            var results = _sut.GetAll().ToList();

            //ASSERT
            results.ShouldBe(resistanceBands);
            _repo.Verify(mock => mock.Get(), Times.Once);
        }

        [TestMethod]
        public void Should_Get_By_ID()
        {
            //ARRANGE
            var resistanceBand = new ResistanceBand { Color = "Blue", MaxResistanceAmount = 13 };
            _repo.Setup(mock => mock.Get(It.IsAny<int>())).Returns(resistanceBand);

            //ACT
            var result = _sut.GetById(1);

            //ASSERT
            result.ShouldBe(resistanceBand);
            _repo.Verify(mock => mock.Get(It.IsAny<int>()), Times.Once);
        }

        [TestMethod]
        public void Should_Get_Individual_Bands()
        {
            //ARRANGE
            int expectedCount = _bands.Sum(band => band.NumberAvailable);

            //ACT
            var result = _sut.GetIndividualBands();

            //ASSERT
            Assert.AreEqual(expectedCount, result.Count);
            foreach (var band in _bands)
            {
                Assert.AreEqual(band.NumberAvailable, result.Count(resultBand => resultBand.Color == band.Color));
            }
        }

        [TestMethod]
        public void Should_Calculate_Next_Resistance_Amount_When_Scenario_Is_Simple()
        {
            //TODO: Refine/base expectations dynamically not statically

            //ARRANGE

            //ACT
            var result = _sut.GetResistanceBandsForResistanceAmountRange(30, 3, 5, false, false);

            //ASSERT
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual(35, result.Sum(band => band.MaxResistanceAmount));
            Assert.IsTrue(
                result.Count(band => band.Color == "Orange") == 1 
                && result.Count(band => band.Color == "Green") == 1);
        }

        [TestMethod]
        public void Should_Calculate_Next_Resistance_Amount_When_Scenario_Is_Not_So_Simple()
        {
            //TODO: Refine/base expectations dynamically not statically

            //ARRANGE

            //ACT
            var result = _sut.GetResistanceBandsForResistanceAmountRange(30, 20, 25, false, false);

            //ASSERT
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual(53, result.Sum(band => band.MaxResistanceAmount));
            Assert.IsTrue(
                result.Count(band => band.Color == "Onyx") == 1
                && result.Count(band => band.Color == "Blue") == 1);
        }

        [TestMethod]
        public void Should_Calculate_Next_Resistance_Amount_When_Scenario_Is_Complex()
        {
            //TODO: Refine/base expectations dynamically not statically

            //ARRANGE

            //ACT
            var result = _sut.GetResistanceBandsForResistanceAmountRange(40, 20, 30, false, false);

            //ASSERT
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual(70, result.Sum(band => band.MaxResistanceAmount));
            Assert.IsTrue(
                result.Count(band => band.Color == "Onyx") == 1
                && result.Count(band => band.Color == "Orange") == 1);
        }

        [TestMethod]
        public void Should_Calculate_Next_Resistance_Amount_When_Scenario_Is_Complex2()
        {
            //TODO: Refine/base expectations dynamically not statically

            //ARRANGE

            //ACT
            var result = _sut.GetResistanceBandsForResistanceAmountRange(40, 20, 25, false, false);

            //ASSERT
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual(63, result.Sum(band => band.MaxResistanceAmount));
            Assert.IsTrue(
                result.Count(band => band.Color == "Onyx") == 1
                && result.Count(band => band.Color == "Purple") == 1);
        }

        [TestMethod]
        public void Should_Calculate_Next_Resistance_Amount_When_Band_Resistances_Are_Doubled()
        {
            //TODO: Refine/base expectations dynamically not statically

            //ARRANGE

            //ACT
            var result = _sut.GetResistanceBandsForResistanceAmountRange(120, 10, 15, true, false);

            //ASSERT
            Assert.AreEqual(3, result.Count);
            Assert.AreEqual(132, result.Sum(band => band.MaxResistanceAmount) * 2);
            Assert.IsTrue(
                result.Count(band => band.Color == "Onyx") == 1
                && result.Count(band => band.Color == "Purple") == 1
                && result.Count(band => band.Color == "Yellow") == 1);
        }

        [TestMethod]
        public void Should_Calculate_Previous_Resistance_Amount_When_Scenario_Is_Simple()
        {
            //TODO: Refine/base expectations dynamically not statically

            //ARRANGE

            //ACT
            var result = _sut.GetResistanceBandsForResistanceAmountRange(10, -5, -10, false, false);

            //ASSERT
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual(5, result.Sum(band => band.MaxResistanceAmount));
            Assert.IsTrue(result.Count(band => band.Color == "Green") == 1);
        }

        [TestMethod]
        public void Should_Calculate_Previous_Resistance_Amount_When_Scenario_Is_Simple2()
        {
            //TODO: Refine/base expectations dynamically not statically

            //ARRANGE

            //ACT
            //var result = sut.CalculatePreviousAvailableResistanceAmount(30, 5, 10, false);
            var result = _sut.GetResistanceBandsForResistanceAmountRange(30, -3, -13, false, false);

            //ASSERT
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual(23, result.Sum(band => band.MaxResistanceAmount));
            Assert.IsTrue(result.Count(band => band.Color == "Purple") == 1);
        }

        [TestMethod]
        public void Should_Calculate_Previous_Resistance_Amount_When_Scenario_Is_Not_Simple()
        {
            //TODO: Refine/base expectations dynamically not statically

            //ARRANGE

            //ACT
            var result = _sut.GetResistanceBandsForResistanceAmountRange(35, -5, -10, false, false);

            //ASSERT
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual(30, result.Sum(band => band.MaxResistanceAmount));
            Assert.IsTrue(result.Count(band => band.Color == "Orange") == 1);
        }

        [TestMethod]
        public void Should_Calculate_Previous_Resistance_Amount_When_Scenario_Is_Not_Simple2()
        {
            //TODO: Refine/base expectations dynamically not statically

            //ARRANGE

            //ACT
            //106 = Purple and Orange bands
            var result = _sut.GetResistanceBandsForResistanceAmountRange(106, -6, -16, true, false);

            //ASSERT
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual(96, (result.Sum(band => band.MaxResistanceAmount) * 2)); //Multiply by 2 for bands doubled over (true param above)
            Assert.IsTrue(result.Count(band => band.Color == "Onyx") == 1);
            Assert.IsTrue(result.Count(band => band.Color == "Red") == 1);
        }

        [TestMethod]
        public void Should_Calculate_Previous_Resistance_Amount_When_Scenario_Is_Complex()
        {
            //TODO: Refine/base expectations dynamically not statically

            //ARRANGE

            //ACT
            var result = _sut.GetResistanceBandsForResistanceAmountRange(80, -20, -25, false, false);

            //ASSERT
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual(59, result.Sum(band => band.MaxResistanceAmount));
            Assert.IsTrue(
                result.Count(band => band.Color == "Onyx") == 1
                && result.Count(band => band.Color == "Black") == 1);
        }

        [TestMethod]
        public void Should_Calculate_Previous_Resistance_Amount_When_Band_Resistances_Are_Doubled()
        {
            //TODO: Refine/base expectations dynamically not statically

            //ARRANGE

            //ACT
            var result = _sut.GetResistanceBandsForResistanceAmountRange(120, -20, -25, true, false);

            //ASSERT
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual(96, result.Sum(band => band.MaxResistanceAmount) * 2);
            Assert.IsTrue(
                result.Count(band => band.Color == "Onyx") == 1
                && result.Count(band => band.Color == "Red") == 1);
        }

        [TestMethod]
        public void Should_Get_Lowest_Resistance_Band()
        {
            //ARRANGE
            var lowestBand = _bands.MinBy(x => x.MaxResistanceAmount);

            //ACT
            var result = _sut.GetLowestResistanceBand();

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsTrue(result.MaxResistanceAmount == lowestBand.MaxResistanceAmount);
            _repo.Verify(x => x.Get(), Times.Once);
        }

        [TestMethod]
        public void Should_Get_Lowest_Resistance_Band_From_Variable_If_Already_Retrieved()
        {
            //ARRANGE
            var lowestBand = _bands.MinBy(x => x.MaxResistanceAmount);

            //ACT
            var result = _sut.GetLowestResistanceBand();
            var resultAgain = _sut.GetLowestResistanceBand();

            //ASSERT
            Assert.IsNotNull(resultAgain);
            Assert.IsTrue(resultAgain.MaxResistanceAmount == lowestBand.MaxResistanceAmount);
            _repo.Verify(x => x.Get(), Times.Once);
        }

        [TestMethod]
        public void Should_Return_No_Bands_For_Bilateral_Exercise_When_None_Meet_Criteria()
        {
            //ARRANGE


            //ACT
            var result = _sut.GetResistanceBandsForResistanceAmountRange(80, 4, 10, true, true);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.AreEqual(0, result.Count);
        }

        [TestMethod]
        public void Should_Return_Bands_For_Bilateral_Exercise()
        {
            //ARRANGE
            //Set the repo up differently for this one
            //_repo = new Mock<IRepository<ResistanceBand>>(MockBehavior.Strict);
            _bands = new List<ResistanceBand>(8)
            {
                new ResistanceBand { Color = "Onyx", MaxResistanceAmount = 40, NumberAvailable = 3 },
                new ResistanceBand { Color = "Orange", MaxResistanceAmount = 30, NumberAvailable = 4 },
                new ResistanceBand { Color = "Purple", MaxResistanceAmount = 23, NumberAvailable = 2 },
                new ResistanceBand { Color = "Black", MaxResistanceAmount = 19, NumberAvailable = 1 },
                new ResistanceBand { Color = "Blue", MaxResistanceAmount = 13, NumberAvailable = 1 },
                new ResistanceBand { Color = "Red", MaxResistanceAmount = 8, NumberAvailable = 2 },
                new ResistanceBand { Color = "Green", MaxResistanceAmount = 5, NumberAvailable = 2 },
                new ResistanceBand { Color = "Yellow", MaxResistanceAmount = 3, NumberAvailable = 1 }
            };

            _repo
                .Setup(mock => mock.Get())
                .Returns(_bands.AsQueryable());

            _repo
                .Setup(mock => mock.Add(It.IsAny<ResistanceBand>(), true))
                .Returns((ResistanceBand resistanceBand, bool save) => resistanceBand);

            _repo
                .Setup(mock => mock.Delete(It.IsAny<int>()));

            _repo
                .Setup(mock => mock.Update(It.IsAny<ResistanceBand>(), true))
                .Returns((ResistanceBand resistanceBand, bool save) => resistanceBand);


            //ACT
            var result = _sut.GetResistanceBandsForResistanceAmountRange(160, 40, 60, true, true);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.AreEqual(6, result.Count);
            Assert.AreEqual(212, result.Sum(x => x.MaxResistanceAmount) * 2);
        }

        private void SetupRepoMock()
        {
            _repo = new Mock<IRepository<ResistanceBand>>(MockBehavior.Strict);
            _bands = new List<ResistanceBand>(8)
            {
                new ResistanceBand { Color = "Onyx", MaxResistanceAmount = 40, NumberAvailable = 3 },
                new ResistanceBand { Color = "Orange", MaxResistanceAmount = 30, NumberAvailable = 4 },
                new ResistanceBand { Color = "Purple", MaxResistanceAmount = 23, NumberAvailable = 2 },
                new ResistanceBand { Color = "Black", MaxResistanceAmount = 19, NumberAvailable = 1 },
                new ResistanceBand { Color = "Blue", MaxResistanceAmount = 13, NumberAvailable = 1 },
                new ResistanceBand { Color = "Red", MaxResistanceAmount = 8, NumberAvailable = 1 },
                new ResistanceBand { Color = "Green", MaxResistanceAmount = 5, NumberAvailable = 1 },
                new ResistanceBand { Color = "Yellow", MaxResistanceAmount = 3, NumberAvailable = 1 }
            };

            _repo
                .Setup(mock => mock.Get())
                .Returns(_bands.AsQueryable());

            _repo
                .Setup(mock => mock.Add(It.IsAny<ResistanceBand>(), true))
                .Returns((ResistanceBand resistanceBand, bool save) => resistanceBand);

            _repo
                .Setup(mock => mock.Delete(It.IsAny<int>()));

            _repo
                .Setup(mock => mock.Update(It.IsAny<ResistanceBand>(), true))
                .Returns((ResistanceBand resistanceBand, bool save) => resistanceBand);
        }

    }
}
