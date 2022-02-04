using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
        [TestMethod]
        public void Should_Create_ExecutedWorkout_From_ExercisePlan()
        {
            //ARRANGE
            DateTime submittedDate = new DateTime(2020, 2, 3);
            var plan = new WorkoutPlan();
            plan.WorkoutId = 5;
            plan.WorkoutName = "Chest and Arms v1";
            plan.UserId = 1;
            plan.SubmittedDateTime = submittedDate;
            plan.Exercises = new List<ExercisePlan>(3);
            plan.Exercises.Add(
                new ExercisePlan()
                {
                    ExerciseId = 101, 
                    TargetRepCount = 10, 
                    ResistanceAmount = 80, 
                    ResistanceMakeup = "Onyx, Onxy"
                }
            );
            plan.Exercises.Add(
                new ExercisePlan()
                {
                    ExerciseId = 102,
                    TargetRepCount = 12,
                    ResistanceAmount = 30,
                    ResistanceMakeup = "Orange"
                }
            );
            plan.Exercises.Add(
                new ExercisePlan()
                {
                    ExerciseId = 103,
                    TargetRepCount = 8,
                    ResistanceAmount = 5,
                    ResistanceMakeup = "Green"
                }
            );

            var workout = new Workout();
            workout.Exercises = new List<ExerciseInWorkout>(3);
            workout.Exercises.Add(
                new ExerciseInWorkout()
                {
                    ExerciseId = 101, 
                    Exercise = new Exercise() { Id = 101 }, 
                    SetType = SetType.Repetition, 
                    Sequence = 0
                }
            );
            workout.Exercises.Add(
                new ExerciseInWorkout()
                {
                    ExerciseId = 102,
                    Exercise = new Exercise() { Id = 102 },
                    SetType = SetType.Timed,
                    Sequence = 1
                }
            );
            workout.Exercises.Add(
                new ExerciseInWorkout()
                {
                    ExerciseId = 103,
                    Exercise = new Exercise() { Id = 102 },
                    SetType = SetType.Repetition,
                    Sequence = 2
                }
            );
            var workoutRepo = new Mock<IRepository<Workout>>(MockBehavior.Strict);
            workoutRepo.Setup(x => x.Get(It.IsAny<int>())).Returns(workout);
            var executedWorkoutRepo = new Mock<IRepository<ExecutedWorkout>>(MockBehavior.Strict);
            var recommendationService = new Mock<IExerciseAmountRecommendationService>(MockBehavior.Strict);
            var userService = new Mock<IUserService>(MockBehavior.Strict);
            var sut =
                new ExecutedWorkoutService(
                    executedWorkoutRepo.Object,
                    workoutRepo.Object,
                    recommendationService.Object,
                    userService.Object);

            //ACT
            var result = sut.Create(plan);

            //ASSERT
            Assert.IsNotNull(result);
            //TODO: Finish this test
        }
    }
}
