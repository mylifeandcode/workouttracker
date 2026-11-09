using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.API.Configuration;

namespace WorkoutTracker.Tests.Configuration
{
    [TestClass]
    public class CorsOriginValidatorTests
    {
        private static IConfiguration BuildConfiguration(params string[] origins)
        {
            var data = new Dictionary<string, string?>();
            for (var i = 0; i < origins.Length; i++)
                data[$"Cors:AllowedOrigins:{i}"] = origins[i];

            return new ConfigurationBuilder().AddInMemoryCollection(data).Build();
        }

        [TestMethod]
        public void Should_Return_Empty_When_Section_Is_Missing()
        {
            //ARRANGE
            var configuration = new ConfigurationBuilder().Build();

            //ACT
            var result = CorsOriginValidator.GetValidatedOrigins(configuration);

            //ASSERT
            result.ShouldBeEmpty();
        }

        [TestMethod]
        public void Should_Return_Valid_Origins_Including_Ports()
        {
            //ARRANGE
            var configuration = BuildConfiguration("https://app.example.com", "http://192.168.1.10:8080");

            //ACT
            var result = CorsOriginValidator.GetValidatedOrigins(configuration);

            //ASSERT
            result.ShouldBe(new[] { "https://app.example.com", "http://192.168.1.10:8080" });
        }

        [TestMethod]
        public void Should_Ignore_Blank_Entries()
        {
            //ARRANGE
            var configuration = BuildConfiguration("", "   ", "https://app.example.com");

            //ACT
            var result = CorsOriginValidator.GetValidatedOrigins(configuration);

            //ASSERT
            result.ShouldBe(new[] { "https://app.example.com" });
        }

        [TestMethod]
        public void Should_Normalize_Casing_And_Default_Ports_And_Remove_Duplicates()
        {
            //ARRANGE
            var configuration = BuildConfiguration("HTTPS://App.Example.com:443", "https://app.example.com");

            //ACT
            var result = CorsOriginValidator.GetValidatedOrigins(configuration);

            //ASSERT
            result.ShouldBe(new[] { "https://app.example.com" });
        }

        [TestMethod]
        public void Should_Treat_Different_Ports_As_Different_Origins()
        {
            //ARRANGE
            var configuration = BuildConfiguration("http://localhost:4200", "http://localhost:5600");

            //ACT
            var result = CorsOriginValidator.GetValidatedOrigins(configuration);

            //ASSERT
            result.Length.ShouldBe(2);
        }

        [DataTestMethod]
        [DataRow("*")]
        [DataRow("app.example.com")]
        [DataRow("/relative")]
        [DataRow("ftp://app.example.com")]
        [DataRow("https://app.example.com/")]
        [DataRow("https://app.example.com/path")]
        [DataRow("https://app.example.com?x=1")]
        [DataRow("https://app.example.com#frag")]
        [DataRow("https://user:pass@app.example.com")]
        public void Should_Throw_For_Invalid_Origin(string origin)
        {
            //ARRANGE
            var configuration = BuildConfiguration("https://valid.example.com", origin);

            //ACT & ASSERT
            var ex = Should.Throw<InvalidOperationException>(() => CorsOriginValidator.GetValidatedOrigins(configuration));
            ex.Message.ShouldContain("Cors:AllowedOrigins");
        }
    }
}
