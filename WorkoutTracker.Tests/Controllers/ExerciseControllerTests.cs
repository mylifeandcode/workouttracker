using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;
using WorkoutTracker.Application.Exercises;
using WorkoutTracker.UI.Controllers;

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
    }
}
