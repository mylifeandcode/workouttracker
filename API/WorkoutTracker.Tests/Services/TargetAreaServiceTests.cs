using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Services;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class TargetAreaServiceTests
    {
        private Mock<ILogger<TargetAreaService>> _loggerMock;

        [TestInitialize]
        public void Setup()
        {
            _loggerMock = new Mock<ILogger<TargetAreaService>>(MockBehavior.Strict);
            _loggerMock.Setup(x => x.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()));
        }

        [TestMethod]
        public async Task Should_Get_TargetArea_By_ID()
        {
            //ARRANGE
            var targetArea = new TargetArea();
            int targetAreaId = 5;
            var repo = new Mock<IRepository<TargetArea>>(MockBehavior.Strict);
            repo.Setup(x => x.GetAsync(targetAreaId)).ReturnsAsync(targetArea);
            var sut = new TargetAreaService(repo.Object, _loggerMock.Object);

            //ACT
            var result = await sut.GetAsync(targetAreaId);

            //ASSERT
            Assert.IsNotNull(result);
            repo.Verify(x => x.GetAsync(targetAreaId), Times.Once);
        }

        [TestMethod]
        public async Task Should_Get_All_TargetAreas()
        {
            //ARRANGE
            var allTargetAreas = new List<TargetArea>(3)
            {
                new TargetArea(),
                new TargetArea(),
                new TargetArea()
            };
            var repo = new Mock<IRepository<TargetArea>>(MockBehavior.Strict);
            repo.Setup(x => x.GetAllWithoutTrackingAsync()).ReturnsAsync(allTargetAreas);
            var sut = new TargetAreaService(repo.Object, _loggerMock.Object);

            //ACT
            var results = await sut.GetAllAsync();

            //ASSERT
            Assert.AreEqual(allTargetAreas, results);
            repo.Verify(x => x.GetAllWithoutTrackingAsync(), Times.Once);
        }

        [TestMethod]
        public async Task Should_Get_TargetAreas_By_IDs()
        {
            //ARRANGE
            var allTargetAreas = new List<TargetArea>(5)
            {
                new TargetArea() { Id = 1 },
                new TargetArea() { Id = 2 },
                new TargetArea() { Id = 3 },
                new TargetArea() { Id = 4 },
                new TargetArea() { Id = 5 }
            };
            var repo = new Mock<IRepository<TargetArea>>(MockBehavior.Strict);
            repo.Setup(x => x.GetWithoutTracking()).Returns(allTargetAreas.AsAsyncQueryable());
            var sut = new TargetAreaService(repo.Object, _loggerMock.Object);
            var idsToGet = new int[] { 2, 3, 5 };

            //ACT
            var results = await sut.GetByIdsAsync(idsToGet);

            //ASSERT
            Assert.IsNotNull(results);
            var resultList = new List<TargetArea>(results);
            Assert.AreEqual(idsToGet.Length, resultList.Count);
            for (byte x = 0; x < idsToGet.Length; x++)
            {
                Assert.IsNotNull(resultList.Find(y => y.Id == idsToGet[x]));
            }
            repo.Verify(x => x.GetWithoutTracking(), Times.Once);
        }
    }
}
