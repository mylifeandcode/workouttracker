using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security.Services;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class CryptoServiceTests
    {
        private CryptoService _sut = new CryptoService();

        [TestMethod]
        public void Should_Generate_Salt()
        {
            Assert.IsNotNull(_sut.GenerateSalt());
        }

        [TestMethod]
        public void Should_Compute_Hash()
        {
            Assert.IsNotNull(_sut.ComputeHash("someValueToHash", "someSalt"));
        }

        [TestMethod]
        public void Should_Verify_Clear_Text_Value_With_Hashed_Value()
        {
            const string clearTextValue = "MyValueToHash";
            const string hashedValue = "krbIcgEUXWlOszntUzEHHTvSQy+ig63C";
            const string mySalt = "MySalt";
            Assert.IsTrue(_sut.VerifyValuesMatch(clearTextValue, hashedValue, mySalt));
        }

        [TestMethod]
        public void Should_Generate_Password_Reset_Code()
        {
            Assert.IsNotNull(_sut.GeneratePasswordResetCode());
        }
    }
}
