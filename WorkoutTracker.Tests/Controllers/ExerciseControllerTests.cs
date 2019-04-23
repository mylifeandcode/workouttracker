using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;
using WorkoutTracker.Application.Exercises;
using WorkoutTracker.Application.FilterClasses;
using WorkoutTracker.UI.Controllers;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class ExerciseControllerTests
    {
        [TestMethod]
        public void Should_Get_Exercise_By_ID()
        {
            //ARRANGE
            var exerciseSvc = new Mock<IExerciseService>(MockBehavior.Strict);
            var exercise = new Exercise();
            exerciseSvc.Setup(x => x.GetById(It.IsAny<int>())).Returns(exercise);
            var sut = new ExerciseController(exerciseSvc.Object);

            //ACT
            var response = sut.Get(12345);

            //ASSERT
            Assert.IsNotNull(response);
            Assert.ReferenceEquals(response.Value, exercise);
            Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        }

        [TestMethod]
        public void Should_Return_Not_Found_When_Getting_Exercise_By_ID_And_Not_Found()
        {
            //ARRANGE
            var exerciseSvc = new Mock<IExerciseService>(MockBehavior.Strict);
            exerciseSvc.Setup(x => x.GetById(It.IsAny<int>())).Returns((Exercise)null);
            var sut = new ExerciseController(exerciseSvc.Object);

            //ACT
            var response = sut.Get(12345);

            //ASSERT
            Assert.IsNotNull(response);
            Assert.IsInstanceOfType(response.Result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public void Should_Create_New_Exercise()
        {
            //ARRANGE
            var exerciseSvc = new Mock<IExerciseService>(MockBehavior.Strict);
            var exercise = new Exercise();
            exerciseSvc
                .Setup(x => x.Add(It.IsAny<Exercise>(), true))
                .Returns((Exercise newExercise, bool save) => exercise);

            var sut = new ExerciseController(exerciseSvc.Object);

            //ACT
            var response = sut.Post(exercise);

            //ASSERT
            Assert.IsNotNull(response);
            Assert.ReferenceEquals(response.Value, exercise);
            Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        }

        [TestMethod]
        public void Should_Update_Exxisting_Exercise()
        {
            //ARRANGE
            var exerciseSvc = new Mock<IExerciseService>(MockBehavior.Strict);
            var exercise = new Exercise();
            exerciseSvc
                .Setup(x => x.Update(It.IsAny<Exercise>(), true))
                .Returns((Exercise newExercise, bool save) => exercise);

            var sut = new ExerciseController(exerciseSvc.Object);

            //ACT
            var response = sut.Put(exercise.Id, exercise);

            //ASSERT
            Assert.IsNotNull(response);
            Assert.ReferenceEquals(response.Value, exercise);
            Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        }

        [TestMethod]
        public void Should_Get_Exercises_Without_Filtering()
        {
            //ARRANGE
            var exerciseSvc = new Mock<IExerciseService>(MockBehavior.Strict);
            var exercises = new List<Exercise>(0);
            exerciseSvc
                .Setup(x => x.Get(It.IsAny<int>(), It.IsAny<short>(), It.IsAny<ExerciseFilter>()))
                .Returns(exercises);

            exerciseSvc
                .Setup(x => x.GetTotalCount())
                .Returns(100);

            var sut = new ExerciseController(exerciseSvc.Object);

            //ACT
            var response = sut.Get(0, 20);

            //ASSERT
            Assert.IsNotNull(response);
            Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
            //var results = (response.Result as PaginatedResults<ExerciseDTO>);
            //TODO: Complete this test
        }
    }
}
