using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.API.Controllers;
using WorkoutTracker.API.Mappers;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class TargetAreasControllerTests : UserAwareControllerTestsBase
    {
        [TestMethod]
        public async Task Should_Get_All()
        {
            //ARRANGE
            var targetAreas = new List<TargetArea>(2)
            {
                new TargetArea { Id = 1, Name = "Legs" },
                new TargetArea { Id = 2, Name = "Chest" }
            };
            var service = new Mock<ITargetAreaService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetAllAsync()).ReturnsAsync(targetAreas);
            var sut = new TargetAreasController(service.Object, new TargetAreaDTOMapper(), LoggerFactory);

            //ACT
            var result = await sut.Get();

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var dtos = ((result.Result as OkObjectResult).Value as IEnumerable<TargetAreaDTO>).ToList();
            Assert.AreEqual(targetAreas.Count, dtos.Count);
            CollectionAssert.AreEquivalent(targetAreas.Select(x => x.Name).ToList(), dtos.Select(x => x.Name).ToList());
        }

        [TestMethod]
        public async Task Should_Get_By_Id()
        {
            //ARRANGE
            var targetArea = new TargetArea { Id = 1, Name = "Legs" };
            var service = new Mock<ITargetAreaService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetAsync(It.IsAny<int>())).ReturnsAsync(targetArea);
            var sut = new TargetAreasController(service.Object, new TargetAreaDTOMapper(), LoggerFactory);

            //ACT
            var result = await sut.Get(1);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var dto = (result.Result as OkObjectResult).Value as TargetAreaDTO;
            Assert.IsNotNull(dto);
            Assert.AreEqual(targetArea.Id, dto.Id);
            Assert.AreEqual(targetArea.Name, dto.Name);
        }

        [TestMethod]
        public async Task Should_Return_NotFound_When_Getting_By_Id_And_Not_Found()
        {
            //ARRANGE
            var service = new Mock<ITargetAreaService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetAsync(It.IsAny<int>())).ReturnsAsync((TargetArea)null);
            var sut = new TargetAreasController(service.Object, new TargetAreaDTOMapper(), LoggerFactory);

            //ACT
            var result = await sut.Get(2);

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundObjectResult));
        }
    }
}
