using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Workouts.Services;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class WorkoutServiceTests
    {
        private Mock<ILogger<WorkoutService>> _logger;

        [TestInitialize]
        public void Initialize()
        {
            _logger = new Mock<ILogger<WorkoutService>>(MockBehavior.Strict);
            _logger.Setup(x => x.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()));
        }

        [TestMethod]
        public async Task Should_Add_Workout()
        {
            //ARRANGE
            var workout = new Workout();
            var repoMock = new Mock<IRepository<Workout>>(MockBehavior.Strict);

            repoMock
                .Setup(mock => mock.AddAsync(It.IsAny<Workout>(), true))
                .ReturnsAsync(workout);

            var sut = new WorkoutService(repoMock.Object, _logger.Object);

            //ACT
            var result = await sut.AddAsync(workout, true);

            //ASSERT
            result.ShouldBeSameAs(workout);
            repoMock.Verify(mock => mock.AddAsync(workout, true), Times.Once);
        }

        [TestMethod]
        public async Task Should_Update_Workout()
        {
            //ARRANGE
            //TODO: Create builder for these Workouts
            var modifiedWorkout =
                new Workout
                {
                    Id = 1,
                    Exercises =
                        new List<ExerciseInWorkout>(2)
                        {
                            new ExerciseInWorkout { Id = 1 },
                            new ExerciseInWorkout { Id = 2 }
                        }
                };

            var existingWorkout =
                new Workout
                {
                    Id = 1,
                    Exercises =
                        new List<ExerciseInWorkout>(2)
                        {
                            new ExerciseInWorkout { Id = 1 },
                            new ExerciseInWorkout { Id = 3 }
                        }
                };

            var repoMock = new Mock<IRepository<Workout>>(MockBehavior.Strict);

            repoMock
                .Setup(mock => mock.UpdateAsync<Workout>(modifiedWorkout, It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<Workout, object>>[]>()))
                .Returns(Task.FromResult(existingWorkout.Id));

            var sut = new WorkoutService(repoMock.Object, _logger.Object);

            //ACT
            var result = await sut.UpdateAsync(modifiedWorkout, true);

            //ASSERT
            result.ShouldBeSameAs(modifiedWorkout);
            repoMock.Verify(mock => mock.UpdateAsync(modifiedWorkout, It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<Workout, object>>[]>()), Times.Once);
        }

        [TestMethod]
        public async Task Should_Get_Id_By_Public_Id()
        {
            //ARRANGE
            var publicId = Guid.NewGuid();
            var workouts = new List<Workout>
            {
                new Workout { Id = 1, PublicId = Guid.NewGuid() },
                new Workout { Id = 2, PublicId = publicId }
            };

            var repoMock = new Mock<IRepository<Workout>>(MockBehavior.Strict);
            repoMock.Setup(mock => mock.GetWithoutTracking()).Returns(workouts.AsAsyncQueryable());

            var sut = new WorkoutService(repoMock.Object, _logger.Object);

            //ACT
            var result = await sut.GetIdByPublicIdAsync(publicId);

            //ASSERT
            result.ShouldBe(2);
        }

        [TestMethod]
        public async Task Should_Return_Null_When_Getting_Id_By_Public_Id_And_Not_Found()
        {
            //ARRANGE
            var workouts = new List<Workout>
            {
                new Workout { Id = 1, PublicId = Guid.NewGuid() }
            };

            var repoMock = new Mock<IRepository<Workout>>(MockBehavior.Strict);
            repoMock.Setup(mock => mock.GetWithoutTracking()).Returns(workouts.AsAsyncQueryable());

            var sut = new WorkoutService(repoMock.Object, _logger.Object);

            //ACT
            var result = await sut.GetIdByPublicIdAsync(Guid.NewGuid());

            //ASSERT
            result.ShouldBeNull();
        }
    }
}
