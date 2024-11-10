using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Application.Workouts.Services;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class ExecutedWorkoutServiceTests
    {
        private Mock<ILogger<ExecutedWorkoutService>> _logger;

        [TestInitialize]
        public void Initialize()
        {
            _logger = new Mock<ILogger<ExecutedWorkoutService>>(MockBehavior.Strict);
            _logger.Setup(x => x.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()));
        }

        [TestMethod]
        public void Should_Create_ExecutedWorkout_From_ExercisePlan()
        {
            //ARRANGE
            DateTime submittedDate = new DateTime(2020, 2, 3);
            int userId = 123;
            var workoutPlan = new WorkoutPlan();
            //workoutPlan.WorkoutId = 5;
            workoutPlan.WorkoutId = Guid.NewGuid();
            workoutPlan.WorkoutName = "Chest and Arms v1";
            workoutPlan.SubmittedDateTime = submittedDate;
            workoutPlan.Exercises = new List<ExercisePlan>(3);
            workoutPlan.Exercises.Add(
                new ExercisePlan()
                {
                    ExerciseId = 101, 
                    TargetRepCount = 10, 
                    ResistanceAmount = 80, 
                    ResistanceMakeup = "Onyx, Onxy"
                }
            );
            workoutPlan.Exercises.Add(
                new ExercisePlan()
                {
                    ExerciseId = 102,
                    TargetRepCount = 12,
                    ResistanceAmount = 30,
                    ResistanceMakeup = "Orange"
                }
            );
            workoutPlan.Exercises.Add(
                new ExercisePlan()
                {
                    ExerciseId = 103,
                    TargetRepCount = 8,
                    ResistanceAmount = 5,
                    ResistanceMakeup = "Green"
                }
            );

            var workout = new Workout();
            workout.PublicId = workoutPlan.WorkoutId;
            workout.CreatedByUserId = userId;
            workout.Exercises = new List<ExerciseInWorkout>(3);
            workout.Exercises.Add(
                new ExerciseInWorkout()
                {
                    ExerciseId = 101, 
                    Exercise = new Exercise() { Id = 101 }, 
                    NumberOfSets = 2, 
                    SetType = SetType.Repetition, 
                    Sequence = 0
                }
            );
            workout.Exercises.Add(
                new ExerciseInWorkout()
                {
                    ExerciseId = 102,
                    Exercise = new Exercise() { Id = 102 },
                    NumberOfSets = 3, 
                    SetType = SetType.Timed,
                    Sequence = 1
                }
            );
            workout.Exercises.Add(
                new ExerciseInWorkout()
                {
                    ExerciseId = 103,
                    Exercise = new Exercise() { Id = 103, OneSided = true },
                    NumberOfSets = 4, 
                    SetType = SetType.Repetition,
                    Sequence = 2
                }
            );

            var workoutRepo = new Mock<IRepository<Workout>>(MockBehavior.Strict);
            //workoutRepo.Setup(x => x.GetWithoutTracking(It.IsAny<int>())).Returns(workout);
            workoutRepo.Setup(x => x.GetWithoutTracking()).Returns(new List<Workout>([workout]).AsQueryable());

            var executedWorkoutRepo = new Mock<IRepository<ExecutedWorkout>>(MockBehavior.Strict);
            executedWorkoutRepo
                .Setup(x => x.Add(It.IsAny<ExecutedWorkout>(), true))
                .Returns((ExecutedWorkout executedWorkout, bool saveChanges) => executedWorkout);

            var sut =
                new ExecutedWorkoutService(
                    executedWorkoutRepo.Object,
                    workoutRepo.Object,
                    _logger.Object);

            //ACT
            var result = sut.Create(workoutPlan, true);

            //ASSERT
            Assert.IsNotNull(result, "result is null.");
            Assert.IsNotNull(result.Exercises, "result.Exercises is null.");
            Assert.AreEqual(workout.Exercises.Sum(x => x.NumberOfSets * (x.Exercise.OneSided ? 2 : 1)), result.Exercises.Count, "result.Exercises.Count isn't as expected.");
            Assert.AreEqual(submittedDate, result.StartDateTime, "result.StartDateTime is not as expected.");
            
            byte exerciseSequence = 0;
            foreach (var exerciseInWorkout in workout.Exercises?.OrderBy(x => x.Sequence))
            {
                //Find the ExercisePlan in the submitted WorkoutPlan for this exercise
                var exercisePlan = workoutPlan.Exercises.First(exPlan => exPlan.ExerciseId == exerciseInWorkout.ExerciseId);
                var executedExercisesInResult = result.Exercises.Where(x => x.ExerciseId == exerciseInWorkout.ExerciseId).OrderBy(x => x.Sequence).ToList();
                Assert.AreEqual(exerciseInWorkout.NumberOfSets * (exerciseInWorkout.Exercise.OneSided ? 2 : 1), executedExercisesInResult.Count, $"Number of exercise in result not as expected for ExerciseId {exerciseInWorkout.ExerciseId}.");
                for (byte x = 0; x < exerciseInWorkout.NumberOfSets * (exerciseInWorkout.Exercise.OneSided ? 2 : 1); x++)
                {
                    //Confirm audit values
                    Assert.AreEqual(workout.CreatedByUserId, executedExercisesInResult[x].CreatedByUserId);
                    Assert.AreEqual(submittedDate, executedExercisesInResult[x].CreatedDateTime);
                    
                    //Confirm exercise

                    //NOPE for this condition -- having the object and not just the ID caused trouble elsewhere!
                    //Assert.AreEqual(exerciseInWorkout.Exercise, executedExercisesInResult[x].Exercise);
                    
                    Assert.AreEqual(exerciseInWorkout.ExerciseId, executedExercisesInResult[x].ExerciseId);
                    Assert.AreEqual(exerciseInWorkout.SetType, executedExercisesInResult[x].SetType);

                    //Confirm sequence
                    Assert.AreEqual(exerciseSequence, executedExercisesInResult[x].Sequence);

                    //Confirm exercise plan values
                    Assert.AreEqual(exercisePlan.TargetRepCount, executedExercisesInResult[x].TargetRepCount);
                    Assert.AreEqual(exercisePlan.ResistanceAmount, executedExercisesInResult[x].ResistanceAmount);
                    Assert.AreEqual(exercisePlan.ResistanceMakeup, executedExercisesInResult[x].ResistanceMakeup);

                    exerciseSequence++;
                }
            }
            executedWorkoutRepo.Verify(x => x.Add(It.IsAny<ExecutedWorkout>(), true), Times.Once());

        }

        [TestMethod]
        public void Should_Add_ExecutedWorkout()
        {
            //TODO: Implement
        }

        [TestMethod]
        public void Should_Update_ExecutedWorkout()
        {
            //ARRANGE
            var modifiedExecutedWorkout = new ExecutedWorkout();
            byte numberOfExercises = 3;
            modifiedExecutedWorkout.Exercises = new List<ExecutedExercise>(numberOfExercises);
            for (byte x = 0; x < numberOfExercises; x++)
            {
                modifiedExecutedWorkout.Exercises.Add(new ExecutedExercise());
            }
            var workoutRepo = new Mock<IRepository<Workout>>(MockBehavior.Strict);

            var executedWorkoutRepo = new Mock<IRepository<ExecutedWorkout>>(MockBehavior.Strict);
            executedWorkoutRepo
                .Setup(x => x.UpdateAsync<ExecutedWorkout>(modifiedExecutedWorkout, It.IsAny<Expression<Func<ExecutedWorkout, object>>[]>()))
                .Returns(Task.FromResult(modifiedExecutedWorkout.Exercises.Count + 1));

            var recommendationService = new Mock<IExerciseAmountRecommendationService>(MockBehavior.Strict);
            var userService = new Mock<IUserService>(MockBehavior.Strict);

            var sut =
                new ExecutedWorkoutService(
                    executedWorkoutRepo.Object,
                    workoutRepo.Object,
                    _logger.Object);

            //ACT
            var result = sut.Update(modifiedExecutedWorkout);

            //ASSERT
            result.ShouldBeSameAs(modifiedExecutedWorkout);
            executedWorkoutRepo
                .Verify(mock => mock.UpdateAsync(modifiedExecutedWorkout, It.IsAny<Expression<Func<ExecutedWorkout, object>>[]>()), 
                Times.Once);
        }

        [TestMethod]
        public void Should_Get_In_Progress_Workouts() 
        {
            //ARRANGE
            int userId = 10;
            ushort numberOfWorkouts = 6;
            var executedWorkouts = new List<ExecutedWorkout>(numberOfWorkouts);
            for (ushort x = 0; x < numberOfWorkouts; x++)
            {
                var workout = new ExecutedWorkout();
                workout.CreatedByUserId = userId;
                if (x % 2 == 0) workout.StartDateTime = new DateTime();
                executedWorkouts.Add(workout);
            }

            var executedWorkoutRepo = new Mock<IRepository<ExecutedWorkout>>(MockBehavior.Strict);
            executedWorkoutRepo
                .Setup(x => x.GetWithoutTracking())
                .Returns(executedWorkouts.AsQueryable());

            var workoutRepo = new Mock<IRepository<Workout>>(MockBehavior.Strict);

            var sut =
                new ExecutedWorkoutService(
                    executedWorkoutRepo.Object,
                    workoutRepo.Object,
                    _logger.Object);

            //ACT
            var results = sut.GetInProgress(userId).ToList();

            //ASSERT
            var expectedResults = executedWorkouts.Where(x => x.StartDateTime.HasValue).ToList();
            CollectionAssert.AreEquivalent(expectedResults, results);
        }

        [TestMethod]
        public void Should_Delete_Planned_Workout()
        {
            //ARRANGE
            var executedWorkoutId = Guid.NewGuid();
            var executedWorkoutRepo = new Mock<IRepository<ExecutedWorkout>>(MockBehavior.Strict);
            executedWorkoutRepo
                .Setup(x => x.Delete(It.IsAny<int>()));

            var executedWorkouts = new List<ExecutedWorkout>(1);
            executedWorkouts.Add(new ExecutedWorkout { Id = 100, PublicId = executedWorkoutId });

            executedWorkoutRepo
                .Setup(x => x.Get())
                .Returns(executedWorkouts.AsQueryable());

            var workoutRepo = new Mock<IRepository<Workout>>(MockBehavior.Strict);

            var sut =
                new ExecutedWorkoutService(
                    executedWorkoutRepo.Object,
                    workoutRepo.Object,
                    _logger.Object);


            //ACT
            sut.DeletePlanned(executedWorkoutId);

            //ASSERT
            executedWorkoutRepo.Verify(x => x.Get(), Times.Once);
            executedWorkoutRepo.Verify(x => x.Delete(100), Times.Once);
        }

        [TestMethod, ExpectedException(typeof(ArgumentException))]
        public void Should_Not_Delete_Planned_Workout_Which_Has_Been_Started()
        {
            var executedWorkoutRepo = new Mock<IRepository<ExecutedWorkout>>(MockBehavior.Strict);
            executedWorkoutRepo
                .Setup(x => x.Delete(It.IsAny<int>()));

            var executedWorkouts = new List<ExecutedWorkout>(1);
            executedWorkouts.Add(new ExecutedWorkout { Id = 100, StartDateTime = new DateTime() });

            executedWorkoutRepo
                .Setup(x => x.Get())
                .Returns(executedWorkouts.AsQueryable());

            var workoutRepo = new Mock<IRepository<Workout>>(MockBehavior.Strict);

            var sut =
                new ExecutedWorkoutService(
                    executedWorkoutRepo.Object,
                    workoutRepo.Object,
                    _logger.Object);


            //ACT
            sut.DeletePlanned(Guid.NewGuid());

            //ASSERT
            //No assertions. Test will fail if ExpectedException doesn't occur.
        }

        [TestMethod, ExpectedException(typeof(ArgumentException))]
        public void Should_Not_Delete_Planned_Workout_When_Not_Found()
        {
            var executedWorkoutRepo = new Mock<IRepository<ExecutedWorkout>>(MockBehavior.Strict);
            executedWorkoutRepo
                .Setup(x => x.Delete(It.IsAny<int>()));

            var executedWorkouts = new List<ExecutedWorkout>(1);
            executedWorkouts.Add(new ExecutedWorkout { Id = 200 });

            executedWorkoutRepo
                .Setup(x => x.Get())
                .Returns(executedWorkouts.AsQueryable());

            var workoutRepo = new Mock<IRepository<Workout>>(MockBehavior.Strict);

            var sut =
                new ExecutedWorkoutService(
                    executedWorkoutRepo.Object,
                    workoutRepo.Object,
                    _logger.Object);


            //ACT
            sut.DeletePlanned(Guid.NewGuid());

            //ASSERT
            //No assertions. Test will fail if ExpectedException doesn't occur.
        }
    }
}
