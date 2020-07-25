using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.Exercises;
using WorkoutTracker.Application.FilterClasses;
using Shouldly;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class ExerciseServiceTests
    {
        [TestMethod]
        public void Should_Get_Exercises_By_Filter()
        {
            //ARRANGE
            var filter = new ExerciseFilter { NameContains = "Press", HasTargetAreas = new List<string>{ "Arms", "Chest" } };
            var exercises = new List<Exercise>(3);
            
            //TODO: Create a builder for this
            exercises.Add(
                new Exercise 
                { 
                    Name = "Seated Row", 
                    ExerciseTargetAreaLinks = 
                        new List<ExerciseTargetAreaLink>(1) 
                        { 
                            new ExerciseTargetAreaLink 
                            { 
                                Id = 5, 
                                TargetArea = new TargetArea { Name = "Back" } 
                            } 
                        } 
                });

            exercises.Add(
                new Exercise
                {
                    Name = "Standing Press",
                    ExerciseTargetAreaLinks =
                        new List<ExerciseTargetAreaLink>(2)
                        {
                            new ExerciseTargetAreaLink
                            {
                                Id = 100, 
                                TargetArea = new TargetArea { Name = "Arms" }
                            },
                            new ExerciseTargetAreaLink
                            {
                                Id = 101, 
                                TargetArea = new TargetArea { Name = "Chest" }
                            }
                        }
                });

            exercises.Add(
                new Exercise
                {
                    Name = "Mental Telepathy Builder",
                    ExerciseTargetAreaLinks =
                        new List<ExerciseTargetAreaLink>(1)
                        {
                            new ExerciseTargetAreaLink
                            {
                                Id = 999, 
                                TargetArea = new TargetArea { Name = "THE MIND!" }
                            }
                        }
                });

            var repoMock = new Mock<IRepository<Exercise>>(MockBehavior.Strict);
            repoMock.Setup(mock => mock.Get()).Returns(exercises.AsQueryable());

            var sut = new ExerciseService(repoMock.Object);

            //ACT
            var results = sut.Get(0, 10, filter);

            //ASSERT
            results.Count().ShouldBe(1);
            var result = results.First();
            result.Name.ShouldBe("Standing Press");
            result.ExerciseTargetAreaLinks.Count.ShouldBe(2);
            result.ExerciseTargetAreaLinks.ShouldContain(link => link.TargetArea.Name == "Chest");
            result.ExerciseTargetAreaLinks.ShouldContain(link => link.TargetArea.Name == "Arms");
        }
    }
}
