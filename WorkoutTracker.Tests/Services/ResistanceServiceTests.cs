using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Services;
using WorkoutTracker.Application.Resistances.Interfaces;

namespace WorkoutTracker.Tests.Services
{
    public class ResistanceServiceTests
    {
        private ResistanceService _sut;
        private Mock<IResistanceBandService> _resistanceBandServiceMock;

        [TestInitialize]
        public void Init()
        {
            _resistanceBandServiceMock = new Mock<IResistanceBandService>(MockBehavior.Strict);
            _sut = new ResistanceService(_resistanceBandServiceMock.Object);
        }
    }
}
