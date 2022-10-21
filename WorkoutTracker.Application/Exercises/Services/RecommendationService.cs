using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Application.Exercises.Services
{
    public abstract class RecommendationService
    {
        #region Constants
        protected const byte LOWEST_ACCEPTABLE_RATING = 4;
        #endregion Constants

        protected static bool HadAdequateRating(byte rating)
        {
            return rating >= LOWEST_ACCEPTABLE_RATING;
        }

        protected static bool HadAdequateRating(byte rating, UserSettings userSettings)
        {
            if(userSettings == null) throw new ArgumentNullException(nameof(userSettings));
            return rating >= userSettings.LowestAcceptableRating;
        }

        protected static bool HadAdequateRating(double rating)
        {
            return rating >= LOWEST_ACCEPTABLE_RATING;
        }

        protected static bool HadAdequateRating(double rating, UserSettings userSettings)
        {
            if (userSettings == null) throw new ArgumentNullException(nameof(userSettings));
            return rating >= userSettings.LowestAcceptableRating;
        }
    }
}
