using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Repository;
using Shouldly;
using System;
using WorkoutTracker.Application.Exercises.Services;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class ExerciseServiceTests
    {
        private Mock<ILogger<ExerciseService>> _logger;

        [TestInitialize]
        public void Initialize()
        {
            _logger = new Mock<ILogger<ExerciseService>>(MockBehavior.Strict);
            _logger.Setup(x => x.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()));
        }

        [TestMethod]
        public async Task Should_Add_Exercise()
        {
            //ARRANGE
            var exercise = new Exercise();
            var repoMock = new Mock<IRepository<Exercise>>(MockBehavior.Strict);

            repoMock
                .Setup(mock => mock.AddAsync(It.IsAny<Exercise>(), true))
                .ReturnsAsync(exercise);

            var sut = new ExerciseService(repoMock.Object, _logger.Object);

            //ACT
            var result = await sut.AddAsync(exercise, true);

            //ASSERT
            result.ShouldBeSameAs(exercise);
            repoMock.Verify(mock => mock.AddAsync(exercise, true), Times.Once);
        }

        [TestMethod]
        public async Task Should_Update_Exercise()
        {
            //ARRANGE
            //TODO: Create builder for these Exercises
            var modifiedExercise =
                new Exercise
                {
                    Id = 1,
                    ExerciseTargetAreaLinks =
                        new List<ExerciseTargetAreaLink>(2)
                        {
                            new ExerciseTargetAreaLink { Id = 1, ExerciseId = 1, TargetAreaId = 3 },
                            new ExerciseTargetAreaLink { Id = 2, ExerciseId = 1, TargetAreaId = 7 }
                        }
                };

            var existingExercise =
                new Exercise
                {
                    Id = 1,
                    ExerciseTargetAreaLinks =
                        new List<ExerciseTargetAreaLink>(2)
                        {
                            new ExerciseTargetAreaLink { Id = 1, ExerciseId = 1, TargetAreaId = 4 },
                            new ExerciseTargetAreaLink { Id = 2, ExerciseId = 1, TargetAreaId = 7 }
                        }
                };

            var repoMock = new Mock<IRepository<Exercise>>(MockBehavior.Strict);

            repoMock
                .Setup(mock => mock.UpdateAsync(existingExercise, true))
                .ReturnsAsync(existingExercise);

            repoMock
                .Setup(mock => mock.GetAsync(1))
                .ReturnsAsync(existingExercise);

            repoMock
                .Setup(mock => mock.SetValues(existingExercise, modifiedExercise));

            var sut = new ExerciseService(repoMock.Object, _logger.Object);

            //ACT
            var result = await sut.UpdateAsync(modifiedExercise, true);

            //ASSERT
            result.ShouldBeSameAs(existingExercise);
            repoMock.Verify(mock => mock.GetAsync(1), Times.Once);
            repoMock.Verify(mock => mock.UpdateAsync(existingExercise, true), Times.Once);
            existingExercise.ExerciseTargetAreaLinks.ShouldNotBeNull();
            existingExercise.ExerciseTargetAreaLinks.Count.ShouldBe(modifiedExercise.ExerciseTargetAreaLinks.Count);
            foreach (var link in existingExercise.ExerciseTargetAreaLinks)
            {
                modifiedExercise
                    .ExerciseTargetAreaLinks.Any(modifiedLink =>
                        modifiedLink.Id == link.Id
                        && modifiedLink.ExerciseId == link.ExerciseId
                        && modifiedLink.TargetAreaId == link.TargetAreaId)
                    .ShouldBeTrue();
            }
        }

        [TestMethod]
        public void Should_Get_Resistance_Types()
        {
            //ARRANGE
            var repoMock = new Mock<IRepository<Exercise>>(MockBehavior.Strict);
            var sut = new ExerciseService(repoMock.Object, _logger.Object);

            //ACT
            var results = sut.GetResistanceTypes();

            //ASSERT
            var resistanceTypeNames = Enum.GetNames(typeof(ResistanceType));
            results.ShouldNotBeNull();
            results.Count.ShouldBe(resistanceTypeNames.Length);
            foreach (var result in results)
            {
                result.Value.ShouldBe(Enum.GetName(typeof(ResistanceType), result.Key));
            }
        }
    }
}
