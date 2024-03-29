﻿using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
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

        //TODO: Fix! The 'Like' method is the issue here.
        /*
        [TestMethod]
        public void Should_Get_Workouts_By_Filter()
        {
            //TODO: Split into separate tests by filter criteria

            //ARRANGE
            var filter = new WorkoutFilter { NameContains = "CHEST", UserId = 4 };
            var workouts = new List<Workout>(4);

            //TODO: Create a builder for this
            workouts.Add(
                new Workout
                {
                    Name = "Legs and Glutes", 
                    CreatedByUserId = 4
                });

            workouts.Add(
                new Workout
                {
                    Name = "Chest and Arms",
                    CreatedByUserId = 4
                });

            workouts.Add(
                new Workout
                {
                    Name = "The Mind!",
                    CreatedByUserId = 4
                });

            workouts.Add(
                new Workout
                {
                    Name = "Chest Workout 2000",
                    CreatedByUserId = 3
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
        */

        [TestMethod]
        public void Should_Add_Workout()
        {
            //ARRANGE
            var workout = new Workout();
            var repoMock = new Mock<IRepository<Workout>>(MockBehavior.Strict);

            repoMock
                .Setup(mock => mock.Add(It.IsAny<Workout>(), true))
                .Returns(workout);

            var sut = new WorkoutService(repoMock.Object, _logger.Object);

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
                .Setup(mock => mock.UpdateAsync<Workout>(modifiedWorkout, It.IsAny<Expression<Func<Workout, object>>[]>()))
                .Returns(Task.FromResult(existingWorkout.Id));

            repoMock
                .Setup(mock => mock.SetValues(existingWorkout, modifiedWorkout));

            var sut = new WorkoutService(repoMock.Object, _logger.Object);

            //ACT
            var result = sut.Update(modifiedWorkout, true);

            //ASSERT
            result.ShouldBeSameAs(modifiedWorkout);
            repoMock.Verify(mock => mock.UpdateAsync(modifiedWorkout, It.IsAny<Expression<Func<Workout, object>>[]>()), Times.Once);
        }
    }
}
