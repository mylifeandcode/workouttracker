using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Resistances;
using WorkoutTracker.Application.Exercises;
using WorkoutTracker.Application.FilterClasses;
using WorkoutTracker.Application.Resistances;
using WorkoutTracker.UI.Controllers;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class ResistanceBandsControllerTests
    {
        [TestMethod]
        public void Should_Get_All()
        {
            //ARRANGE
            var resistanceBands = new List<ResistanceBand>(2) { new ResistanceBand(), new ResistanceBand() };
            var service = new Mock<IResistanceBandService>(MockBehavior.Strict);
            service.Setup(mock => mock.GetAll()).Returns(resistanceBands);
            var sut = new ResistanceBandsController(service.Object);

            //ACT
            var result = sut.Get();

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            Assert.AreEqual(resistanceBands, (result.Result as OkObjectResult).Value);
        }

        public void Should_Get_By_Id()
        {
            throw new NotImplementedException();
        }

        public void Should_Return_NotFound_From_GetById_When_Entity_Not_Found()
        {
            throw new NotImplementedException();
        }

        public void Should_Add()
        {
            throw new NotImplementedException();
        }

        public void Should_Update()
        {
            throw new NotImplementedException();
        }

        public void Should_Delete()
        {
            throw new NotImplementedException();
        }
    }
}
