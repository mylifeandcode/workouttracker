using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.API.Controllers;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class ResistanceBandsControllerTests : UserAwareControllerTestsBase
    {
        [TestMethod]
        public async Task Should_Get_All()
        {
            //ARRANGE
            var resistanceBands = new List<ResistanceBand>(2) { new ResistanceBand(), new ResistanceBand() };
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetAllAsync()).ReturnsAsync(resistanceBands);
            var sut = new ResistanceBandsController(service.Object);

            //ACT
            var result = await sut.Get();

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(resistanceBands, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.GetAllAsync(), Times.Once);
        }

        [TestMethod]
        public async Task Should_Get_By_Id()
        {
            //ARRANGE
            var resistanceBand = new ResistanceBand();
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(resistanceBand);
            var sut = new ResistanceBandsController(service.Object);

            //ACT
            var result = await sut.Get(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(resistanceBand, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.GetByIdAsync(1), Times.Once);
        }

        [TestMethod]
        public async Task Should_Return_NotFound_From_GetById_When_Entity_Not_Found()
        {
            //ARRANGE
            ResistanceBand resistanceBand = null;
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(resistanceBand);
            var sut = new ResistanceBandsController(service.Object);

            //ACT
            var result = await sut.Get(2);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
            service.Verify(mock => mock.GetByIdAsync(2), Times.Once);
        }

        [TestMethod]
        public async Task Should_Add()
        {
            //ARRANGE
            var resistanceBand = new ResistanceBand();
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.AddAsync(resistanceBand)).ReturnsAsync(resistanceBand);
            var sut = new ResistanceBandsController(service.Object);
            SetupUser(sut);

            //ACT
            var result = await sut.Post(resistanceBand);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(resistanceBand, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.AddAsync(resistanceBand), Times.Once);
        }

        [TestMethod]
        public async Task Should_Update()
        {
            //ARRANGE
            var resistanceBand = new ResistanceBand();
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.UpdateAsync(resistanceBand)).ReturnsAsync(resistanceBand);
            var sut = new ResistanceBandsController(service.Object);
            SetupUser(sut);

            //ACT
            var result = await sut.Put(5, resistanceBand);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(resistanceBand, (result.Result as OkObjectResult).Value);
            service.Verify(mock => mock.UpdateAsync(resistanceBand), Times.Once);
        }

        [TestMethod]
        public async Task Should_Delete()
        {
            //ARRANGE
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.DeleteAsync(It.IsAny<int>())).Returns(Task.CompletedTask);
            var sut = new ResistanceBandsController(service.Object);

            //ACT
            var result = await sut.Delete(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            service.Verify(mock => mock.DeleteAsync(1), Times.Once);
        }
    }
}
