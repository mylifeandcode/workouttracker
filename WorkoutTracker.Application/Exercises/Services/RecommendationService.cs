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
        protected const byte HIGHEST_AWFUL_RATING = 2;
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

        protected static bool HadAdequateRating(double rating, byte lowestAcceptableRating)
        {
            return rating >= lowestAcceptableRating;
        }

        protected static bool HadAwfulRating(double rating)
        {
            return rating <= HIGHEST_AWFUL_RATING;
        }
    }
}
