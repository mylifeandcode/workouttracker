using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.API.Controllers;
using WorkoutTracker.API.Mappers;
using WorkoutTracker.API.Models;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class WorkoutControllerTests : UserAwareControllerTestsBase
    {
        private Mock<IWorkoutService> _workoutServiceMock;
        private Mock<IWorkoutPlanService> _workoutPlanServiceMock;
        private Mock<IExecutedWorkoutService> _executedWorkoutServiceMock;
        private IWorkoutDTOMapper _workoutDTOMapper;

        [TestInitialize]
        public void Initialize()
        {
            _workoutServiceMock = new Mock<IWorkoutService>(MockBehavior.Strict);
            _workoutPlanServiceMock = new Mock<IWorkoutPlanService>(MockBehavior.Strict);
            _executedWorkoutServiceMock = new Mock<IExecutedWorkoutService>(MockBehavior.Strict);
            _workoutDTOMapper = new WorkoutDTOMapper();
        }

        private WorkoutController CreateController() =>
            new WorkoutController(
                _workoutServiceMock.Object,
                _workoutPlanServiceMock.Object,
                _executedWorkoutServiceMock.Object,
                _workoutDTOMapper,
                LoggerFactory);

        private static Workout BuildWorkout(int createdByUserId)
        {
            var publicId = Guid.NewGuid();
            var exercise = new Exercise
            {
                Id = 10,
                PublicId = Guid.NewGuid(),
                Name = "Bench Press",
                ResistanceType = ResistanceType.FreeWeight,
                ExerciseTargetAreaLinks = new List<ExerciseTargetAreaLink>
                {
                    new ExerciseTargetAreaLink { TargetArea = new TargetArea { Name = "Chest" } },
                    new ExerciseTargetAreaLink { TargetArea = new TargetArea { Name = "Triceps" } }
                }
            };

            return new Workout
            {
                Id = 1,
                PublicId = publicId,
                Name = "Push Day",
                Active = true,
                CreatedByUserId = createdByUserId,
                Exercises = new List<ExerciseInWorkout>
                {
                    new ExerciseInWorkout
                    {
                        Id = 100,
                        ExerciseId = exercise.Id,
                        Exercise = exercise,
                        NumberOfSets = 3,
                        SetType = SetType.Repetition,
                        Sequence = 1
                    }
                }
            };
        }

        [TestMethod]
        public async Task Should_Get_Workout_By_PublicId()
        {
            //ARRANGE
            var workout = BuildWorkout(createdByUserId: 1);
            _workoutServiceMock.Setup(x => x.GetByPublicIDAsync(workout.PublicId)).ReturnsAsync(workout);
            var sut = CreateController();
            SetupUser(sut);

            //ACT
            var response = await sut.GetByPublicId(workout.PublicId);

            //ASSERT
            Assert.IsNotNull(response);
            Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
            var dto = (response.Result as OkObjectResult).Value as WorkoutDetailDTO;
            Assert.IsNotNull(dto);
            Assert.AreEqual(workout.Id, dto.Id);
            Assert.AreEqual(workout.PublicId, dto.PublicId);
            Assert.AreEqual(workout.CreatedByUserId, dto.CreatedByUserId);
            Assert.AreEqual(workout.Name, dto.Name);
            Assert.AreEqual(workout.Active, dto.Active);

            var exerciseDto = dto.Exercises.Single();
            var exerciseInWorkout = workout.Exercises.Single();
            Assert.AreEqual(exerciseInWorkout.Id, exerciseDto.Id);
            Assert.AreEqual(exerciseInWorkout.ExerciseId, exerciseDto.ExerciseId);
            Assert.AreEqual(exerciseInWorkout.Exercise.Name, exerciseDto.ExerciseName);
            Assert.AreEqual(exerciseInWorkout.NumberOfSets, exerciseDto.NumberOfSets);
            Assert.AreEqual(exerciseInWorkout.SetType, exerciseDto.SetType);
            Assert.AreEqual(exerciseInWorkout.Exercise.ResistanceType, exerciseDto.ResistanceType);
            CollectionAssert.AreEquivalent(new[] { "Chest", "Triceps" }, exerciseDto.TargetAreas.ToList());
        }

        [TestMethod]
        public async Task Should_Return_NotFound_From_GetByPublicId_When_Workout_Not_Found()
        {
            //ARRANGE
            var publicId = Guid.NewGuid();
            _workoutServiceMock.Setup(x => x.GetByPublicIDAsync(publicId)).ReturnsAsync((Workout)null);
            var sut = CreateController();

            //ACT
            var response = await sut.GetByPublicId(publicId);

            //ASSERT
            Assert.IsNotNull(response);
            Assert.IsInstanceOfType(response.Result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task Should_Return_Forbidden_From_GetByPublicId_When_Workout_Belongs_To_Another_User()
        {
            //ARRANGE
            var workout = BuildWorkout(createdByUserId: 2); //SetupUser's claim is UserID "1"
            _workoutServiceMock.Setup(x => x.GetByPublicIDAsync(workout.PublicId)).ReturnsAsync(workout);
            var sut = CreateController();
            SetupUser(sut);

            //ACT
            var response = await sut.GetByPublicId(workout.PublicId);

            //ASSERT
            Assert.IsNotNull(response);
            Assert.IsInstanceOfType(response.Result, typeof(ForbidResult));
        }
    }
}
