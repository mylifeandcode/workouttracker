﻿using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using WorkoutApplication.Repository;
using Shouldly;
using WorkoutApplication.Domain.Resistances;
using WorkoutTracker.Application.Resistances;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class ResistanceBandServiceTests
    {
        private Mock<IRepository<ResistanceBand>> _repo;
        private List<ResistanceBand> _bands;

        [TestInitialize]
        public void Init()
        {
            SetupRepoMock();
        }

        [TestMethod]
        public void Should_Add()
        {
            //ARRANGE
            var repoMock = new Mock<IRepository<ResistanceBand>>(MockBehavior.Strict);
            repoMock
                .Setup(mock => mock.Add(It.IsAny<ResistanceBand>(), true))
                .Returns((ResistanceBand resistanceBand, bool save) => resistanceBand);

            var sut = new ResistanceBandService(repoMock.Object);
            var resistanceBand = new ResistanceBand();

            //ACT
            var result = sut.Add(resistanceBand);

            //ASSERT
            repoMock.Verify(mock => mock.Add(resistanceBand, true), Times.Once);
            result.ShouldBeSameAs(resistanceBand);
        }

        [TestMethod]
        public void Should_Delete()
        {
            //ARRANGE
            var repoMock = new Mock<IRepository<ResistanceBand>>(MockBehavior.Strict);
            repoMock.Setup(mock => mock.Delete(It.IsAny<int>()));

            var sut = new ResistanceBandService(repoMock.Object);
            int resistanceBandId = 5;

            //ACT
            sut.Delete(resistanceBandId);

            //ASSERT
            repoMock.Verify(mock => mock.Delete(resistanceBandId), Times.Once);
        }

        [TestMethod]
        public void Should_Update()
        {
            //ARRANGE
            var repoMock = new Mock<IRepository<ResistanceBand>>(MockBehavior.Strict);
            repoMock
                .Setup(mock => mock.Update(It.IsAny<ResistanceBand>(), true))
                .Returns((ResistanceBand resistanceBand, bool save) => resistanceBand);

            var sut = new ResistanceBandService(repoMock.Object);
            var resistanceBand = new ResistanceBand();

            //ACT
            var result = sut.Update(resistanceBand);

            //ASSERT
            repoMock.Verify(mock => mock.Update(resistanceBand, true), Times.Once);
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

            var repoMock = new Mock<IRepository<ResistanceBand>>(MockBehavior.Strict);
            repoMock.Setup(mock => mock.Get()).Returns(resistanceBands.AsQueryable());

            var sut = new ResistanceBandService(repoMock.Object);

            //ACT
            var results = sut.GetAll().ToList();

            //ASSERT
            results.ShouldBe(resistanceBands);
            repoMock.Verify(mock => mock.Get(), Times.Once);
        }

        [TestMethod]
        public void Should_Get_By_ID()
        {
            //ARRANGE
            var resistanceBand = new ResistanceBand { Color = "Blue", MaxResistanceAmount = 13 };
            var repoMock = new Mock<IRepository<ResistanceBand>>(MockBehavior.Strict);
            repoMock.Setup(mock => mock.Get(It.IsAny<int>())).Returns(resistanceBand);

            var sut = new ResistanceBandService(repoMock.Object);

            //ACT
            var result = sut.GetById(1);

            //ASSERT
            result.ShouldBe(resistanceBand);
            repoMock.Verify(mock => mock.Get(It.IsAny<int>()), Times.Once);
        }

        [TestMethod]
        public void Should_Get_Individual_Bands()
        {
            //ARRANGE
            int expectedCount = _bands.Sum(band => band.NumberAvailable);
            var sut = new ResistanceBandService(_repo.Object);

            //ACT
            var result = sut.GetIndividualBands();

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
            var sut = new ResistanceBandService(_repo.Object);

            //ACT
            var result = sut.CalculateNextAvailableReistanceAmount(30, 3, 5);

            //ASSERT
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual(35, result.Sum(band => band.MaxResistanceAmount));
        }

        private void SetupRepoMock()
        {
            _repo = new Mock<IRepository<ResistanceBand>>(MockBehavior.Strict);
            _bands = new List<ResistanceBand>(8);
            _bands.Add(new ResistanceBand { Color = "Black40", MaxResistanceAmount = 40, NumberAvailable = 2 });
            _bands.Add(new ResistanceBand { Color = "Orange", MaxResistanceAmount = 30, NumberAvailable = 4 });
            _bands.Add(new ResistanceBand { Color = "Purple", MaxResistanceAmount = 23, NumberAvailable = 1 });
            _bands.Add(new ResistanceBand { Color = "Black", MaxResistanceAmount = 19, NumberAvailable = 1 });
            _bands.Add(new ResistanceBand { Color = "Blue", MaxResistanceAmount = 13, NumberAvailable = 1 });
            _bands.Add(new ResistanceBand { Color = "Red", MaxResistanceAmount = 8, NumberAvailable = 1 });
            _bands.Add(new ResistanceBand { Color = "Green", MaxResistanceAmount = 5, NumberAvailable = 1 });
            _bands.Add(new ResistanceBand { Color = "Yellow", MaxResistanceAmount = 3, NumberAvailable = 1 });

            _repo
                .Setup(mock => mock.Get())
                .Returns(_bands.AsQueryable());
        }

    }
}
