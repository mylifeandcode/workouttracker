using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
        public void Should_Get_TargetArea_By_ID()
        {
            //ARRANGE
            var targetArea = new TargetArea();
            int targetAreaId = 5;
            var repo = new Mock<IRepository<TargetArea>>(MockBehavior.Strict);
            repo.Setup(x => x.Get(targetAreaId)).Returns(targetArea);
            var sut = new TargetAreaService(repo.Object, _loggerMock.Object);

            //ACT
            var result = sut.Get(targetAreaId);

            //ASSERT
            Assert.IsNotNull(result);
            repo.Verify(x => x.Get(targetAreaId), Times.Once);
        }

        [TestMethod]
        public void Should_Get_All_TargetAreas()
        {
            //ARRANGE
            var allTargetAreas = 
                new List<TargetArea>(3)
                { 
                    new TargetArea(), 
                    new TargetArea(), 
                    new TargetArea() 
                }.AsQueryable();            
            var repo = new Mock<IRepository<TargetArea>>(MockBehavior.Strict);
            repo.Setup(x => x.Get()).Returns(allTargetAreas);
            var sut = new TargetAreaService(repo.Object, _loggerMock.Object);

            //ACT
            var results = sut.GetAll();

            //ASSERT
            Assert.AreEqual(allTargetAreas, results);
            repo.Verify(x => x.Get(), Times.Once);
        }

        [TestMethod]
        public void Should_Get_TargetAreas_By_IDs()
        {
            //ARRANGE
            var allTargetAreas =
                new List<TargetArea>(5)
                {
                    new TargetArea(){ Id = 1 },
                    new TargetArea(){ Id = 2 },
                    new TargetArea(){ Id = 3 },
                    new TargetArea(){ Id = 4 },
                    new TargetArea(){ Id = 5 }
                }.AsQueryable();
            var repo = new Mock<IRepository<TargetArea>>(MockBehavior.Strict);
            repo.Setup(x => x.Get()).Returns(allTargetAreas);
            var sut = new TargetAreaService(repo.Object, _loggerMock.Object);
            var idsToGet = new int[] { 2, 3, 5 };

            //ACT
            var results = sut.GetByIds(idsToGet);

            //ASSERT
            Assert.IsNotNull(results);
            Assert.AreEqual(idsToGet.Length, results.Count());
            for (byte x = 0; x < idsToGet.Length; x++)
            {
                Assert.IsNotNull(results.First(y => y.Id == idsToGet[x]));
            }
            repo.Verify(x => x.Get(), Times.Once);
        }
    }
}
