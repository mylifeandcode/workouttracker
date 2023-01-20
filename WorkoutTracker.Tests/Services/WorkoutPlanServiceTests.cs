using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Repository;
using Shouldly;
using WorkoutTracker.Domain.Exercises;
using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using WorkoutTracker.Tests.TestHelpers.Builders;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Workouts.Services;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class WorkoutPlanServiceTests
    {
        private ExecutedWorkoutBuilder _executedWorkoutBuilder = new ExecutedWorkoutBuilder();
        private ExecutedExerciseBuilder _executedExerciseBuilder = new ExecutedExerciseBuilder();
        private WorkoutBuilder _workoutBuilder = new WorkoutBuilder();
        private Builder<ExerciseInWorkout> _exerciseInWorkoutBuilder = new Builder<ExerciseInWorkout>();
        private ExerciseBuilder _exerciseBuilder = new ExerciseBuilder();

        private ExecutedWorkout _executedWorkout;

        private Mock<IWorkoutService> _workoutServiceMock = 
            new Mock<IWorkoutService>(MockBehavior.Strict);

        private Mock<IExecutedWorkoutService> _executedWorkoutServiceMock = 
            new Mock<IExecutedWorkoutService>(MockBehavior.Strict);

        private Mock<IUserService> _userServiceMock =
            new Mock<IUserService>(MockBehavior.Strict);

        private Mock<IExerciseAmountRecommendationService> _recommendationServiceMock = 
            new Mock<IExerciseAmountRecommendationService>(MockBehavior.Strict);

        private Mock<ILogger<WorkoutPlanService>> _loggerMock = new Mock<ILogger<WorkoutPlanService>>(MockBehavior.Strict);

        private WorkoutPlanService _sut;

        [TestInitialize]
        public void Setup()
        {
            //TODO: Split up into smaller functions
            var exercise1 =
                _exerciseBuilder
                    .With(x => x.Id = 5)
                    .With(x => x.Name = "Exercise 1")
                    .Build();

            var exercise2 = 
                _exerciseBuilder
                    .With(x => x.Id = 6)
                    .With(x => x.Name = "Exercise 2")
                    .Build();

            var exercise3 =
                _exerciseBuilder
                    .With(x => x.Id = 7)
                    .With(x => x.Name = "Exercise 3")
                    .Build();

            var workout =
                _workoutBuilder
                    .With(x => x.Exercises = new List<ExerciseInWorkout>(3)
                    {
                        _exerciseInWorkoutBuilder
                            .With(x => x.Exercise = exercise1)
                            .With(x => x.ExerciseId = exercise1.Id)
                            .With(x => x.Sequence = 1)
                            .Build(),
                        _exerciseInWorkoutBuilder
                            .With(x => x.Exercise = exercise2)
                            .With(x => x.ExerciseId = exercise2.Id)
                            .With(x => x.Sequence = 2)
                            .Build(),
                        _exerciseInWorkoutBuilder                            
                            .With(x => x.Exercise = exercise3)
                            .With(x => x.ExerciseId = exercise3.Id)
                            .With(x => x.Sequence = 3)
                            .Build()
                    })
                    .Build();

            _executedWorkout =
                _executedWorkoutBuilder
                    .With(x => x.Id = 5)
                    .With(x => x.Workout = workout)
                    .With(x => x.Exercises = new List<ExecutedExercise>(3)
                    {
                        _executedExerciseBuilder
                            .With(x => x.Exercise = exercise1)
                            .With(x => x.ExerciseId = exercise1.Id)
                            .With(x => x.ActualRepCount = 10)
                            .Build(),
                        _executedExerciseBuilder
                            .With(x => x.Exercise = exercise2)
                            .With(x => x.ExerciseId = exercise2.Id)
                            .Build(),
                        _executedExerciseBuilder
                            .With(x => x.Exercise = exercise3)
                            .With(x => x.ExerciseId = exercise3.Id)
                            .Build(),
                    })
                    .Build();

            var user = new User();
            user.Settings = new UserSettings();
            user.Settings.RecommendationsEnabled = false;

            _userServiceMock
                .Setup(x => x.GetById(It.IsAny<int>()))
                .Returns(user);

            _loggerMock.Setup(x => x.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()));

            _sut = new WorkoutPlanService(
                _workoutServiceMock.Object, 
                _executedWorkoutServiceMock.Object, 
                _userServiceMock.Object,
                _recommendationServiceMock.Object, 
                _loggerMock.Object);
        }

        [TestMethod]
        public void Should_Get_WorkoutPlan_For_Workout_Which_Has_Been_Performed_Previously()
        {
            //ARRANGE
            _executedWorkoutServiceMock
                .Setup(x => x.GetLatest(It.IsAny<int>()))
                .Returns(_executedWorkout);

            const int WORKOUT_ID = 1;
            const int USER_ID = 5;

            //ACT
            var plan = _sut.Create(WORKOUT_ID, USER_ID);

            //ASSERT
            plan.ShouldNotBeNull();
            var executedWorkoutExercises = _executedWorkout.Workout.Exercises.ToList();
            for (int x = 0; x < executedWorkoutExercises.Count; x++)
            {
                //TODO: Finish implementing
                plan.Exercises[x].ExerciseId.ShouldBe(executedWorkoutExercises[x].ExerciseId);
                plan.Exercises[x].ExerciseName.ShouldBe(executedWorkoutExercises[x].Exercise.Name);
                //plan.Exercises[x].MaxActualRepCountLastTime
                //plan.Exercises[x].NumberOfSets
                //plan.Exercises[x].ResistanceAmount
                plan.Exercises[x].Sequence.ShouldBe(executedWorkoutExercises[x].Sequence);
                plan.Exercises[x].SetType.ShouldBe(executedWorkoutExercises[x].SetType);
                //plan.Exercises[x].TargetRepCount
                //plan.Exercises[x].TargetRepCountLastTime
            }

            _executedWorkoutServiceMock
                .Verify(x => x.GetLatest(WORKOUT_ID), Times.Once);
            _workoutServiceMock
                .Verify(x => x.GetById(It.IsAny<int>()), Times.Never);
        }

        [TestMethod]
        public void Should_Get_WorkoutPlan_For_Workout_Which_Has_Never_Been_Performed()
        { }

        [TestMethod]
        public void Should_Include_Recommendations_In_WorkoutPlan_When_Suggestions_Are_Enabled()
        { }

        [TestMethod]
        public void Should_Not_Include_Recommendations_In_WorkoutPlan_When_Suggestions_Are_Disabled()
        { }
    }
}
