using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Auth
{
    //From https://www.codemag.com/Article/2105051/Implementing-JWT-Authentication-in-ASP.NET-Core-5
    public interface ITokenService
    {
        string BuildToken(string key, string issuer, User user, int lifetimeMinutes = 15);
        bool IsTokenValid(string key, string issuer, string token);
        System.Security.Claims.ClaimsPrincipal? GetPrincipalFromExpiredToken(string token, string key, string issuer);
    }
}
