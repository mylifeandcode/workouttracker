using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.UI.Controllers;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class ResistanceBandsControllerTests : UserAwareControllerTestsBase
    {
        [TestMethod]
        public void Should_Get_All()
        {
            //ARRANGE
            var resistanceBands = new List<ResistanceBand>(2) { new ResistanceBand(), new ResistanceBand() };
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetAll()).Returns(resistanceBands);
            var sut = new ResistanceBandsController(service.Object);

            //ACT
            var result = sut.Get();

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(resistanceBands, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.GetAll(), Times.Once);
        }

        [TestMethod]
        public void Should_Get_By_Id()
        {
            //ARRANGE
            var resistanceBand = new ResistanceBand();
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetById(It.IsAny<int>())).Returns(resistanceBand);
            var sut = new ResistanceBandsController(service.Object);

            //ACT
            var result = sut.Get(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(resistanceBand, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.GetById(1), Times.Once);
        }

        [TestMethod]
        public void Should_Return_NotFound_From_GetById_When_Entity_Not_Found()
        {
            //ARRANGE
            ResistanceBand resistanceBand = null;
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetById(It.IsAny<int>())).Returns(resistanceBand);
            var sut = new ResistanceBandsController(service.Object);

            //ACT
            var result = sut.Get(2);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
            service.Verify(mock => mock.GetById(2), Times.Once);
        }

        [TestMethod]
        public void Should_Add()
        {
            //ARRANGE
            var resistanceBand = new ResistanceBand();
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.Add(resistanceBand)).Returns(resistanceBand);
            var sut = new ResistanceBandsController(service.Object);
            SetupUser(sut);

            //ACT
            var result = sut.Post(resistanceBand);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(resistanceBand, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.Add(resistanceBand), Times.Once);
        }

        [TestMethod]
        public void Should_Update()
        {
            //ARRANGE
            var resistanceBand = new ResistanceBand();
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.Update(resistanceBand)).Returns(resistanceBand);
            var sut = new ResistanceBandsController(service.Object);
            SetupUser(sut);

            //ACT
            var result = sut.Put(5, resistanceBand);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(resistanceBand, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.Update(resistanceBand), Times.Once);
        }

        [TestMethod]
        public void Should_Delete()
        {
            //ARRANGE
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.Delete(It.IsAny<int>()));
            var sut = new ResistanceBandsController(service.Object);

            //ACT
            var result = sut.Delete(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            service.Verify(mock => mock.Delete(1), Times.Once);
        }
    }
}
