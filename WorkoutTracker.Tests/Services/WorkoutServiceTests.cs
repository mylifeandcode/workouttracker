using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using WorkoutApplication.Domain.Workouts;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.Workouts;
using WorkoutTracker.Application.FilterClasses;
using Shouldly;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class WorkoutServiceTests
    {
        [TestMethod]
        public void Should_Get_Workouts_By_Filter()
        {
            //ARRANGE
            var filter = new WorkoutFilter { NameContains = "CHEST" };
            var workouts = new List<Workout>(3);

            //TODO: Create a builder for this
            workouts.Add(
                new Workout
                {
                    Name = "Legs and Glutes"
                });

            workouts.Add(
                new Workout
                {
                    Name = "Chest and Arms"
                });

            workouts.Add(
                new Workout
                {
                    Name = "The Mind!"
                });

            var repoMock = new Mock<IRepository<Workout>>(MockBehavior.Strict);
            repoMock.Setup(mock => mock.Get()).Returns(workouts.AsQueryable());

            var sut = new WorkoutService(repoMock.Object);

            //ACT
            var results = sut.Get(0, 10, filter);

            //ASSERT
            results.Count().ShouldBe(1);
            var result = results.First();
            result.Name.ShouldBe("Chest and Arms");
        }

        [TestMethod]
        public void Should_Add_Workout()
        {
            //ARRANGE
            var workout = new Workout();
            var repoMock = new Mock<IRepository<Workout>>(MockBehavior.Strict);

            repoMock
                .Setup(mock => mock.Add(It.IsAny<Workout>(), true))
                .Returns(workout);

            var sut = new WorkoutService(repoMock.Object);

            //ACT
            var result = sut.Add(workout, true);

            //ASSERT
            result.ShouldBeSameAs(workout);
            repoMock.Verify(mock => mock.Add(workout, true), Times.Once);
        }

        [TestMethod]
        public void Should_Update_Workout()
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
                            new ExerciseInWorkout
                            {
                                Id = 1
                            },
                            new ExerciseInWorkout
                            {
                                Id = 2
                            }
                        }
                };

            var existingWorkout =
                new Workout
                {
                    Id = 1,
                    Exercises =
                        new List<ExerciseInWorkout>(2)
                        {
                            new ExerciseInWorkout
                            {
                                Id = 1
                            },
                            new ExerciseInWorkout
                            {
                                Id = 3
                            }
                        }
                };

            var repoMock = new Mock<IRepository<Workout>>(MockBehavior.Strict);

            repoMock
                .Setup(mock => mock.Update(existingWorkout, true))
                .Returns(existingWorkout);

            repoMock
                .Setup(mock => mock.Get(1))
                .Returns(existingWorkout);

            repoMock
                .Setup(mock => mock.SetValues(existingWorkout, modifiedWorkout));

            var sut = new WorkoutService(repoMock.Object);

            //ACT
            var result = sut.Update(modifiedWorkout, true);

            //ASSERT
            result.ShouldBeSameAs(existingWorkout);
            repoMock.Verify(mock => mock.Get(1), Times.Once);
            repoMock.Verify(mock => mock.Update(existingWorkout, true), Times.Once);
            foreach (var exercise in existingWorkout.Exercises)
            {
                modifiedWorkout
                    .Exercises.Any(modifiedExerciseInWorkout =>
                        modifiedExerciseInWorkout.Id == exercise.Id)
                    .ShouldBeTrue();
            }
        }
    }
}
