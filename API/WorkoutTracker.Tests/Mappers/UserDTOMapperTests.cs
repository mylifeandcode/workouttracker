using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using System;
using System.Linq;
using WorkoutTracker.API.Mappers;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Tests.Mappers
{
    [TestClass]
    public class UserDTOMapperTests
    {
        private readonly UserDTOMapper _sut = new UserDTOMapper();

        [TestMethod]
        public void Should_Map_A_Summary_Including_Whether_The_User_Is_Active()
        {
            //ARRANGE
            var active = new User { Id = 1, PublicId = Guid.NewGuid(), Name = "Alice" };
            var inactive = new User { Id = 2, PublicId = Guid.NewGuid(), Name = "Bob", IsActive = false };

            //ACT
            var summaries = _sut.MapFromUsersToSummaries(new[] { active, inactive }).ToList();

            //ASSERT
            summaries[0].Id.ShouldBe(1);
            summaries[0].PublicId.ShouldBe(active.PublicId);
            summaries[0].Name.ShouldBe("Alice");
            summaries[0].IsActive.ShouldBeTrue();
            summaries[1].IsActive.ShouldBeFalse();
        }

        [TestMethod]
        public void Should_Consider_A_New_User_Active_By_Default()
        {
            new User().IsActive.ShouldBeTrue();
        }
    }
}
