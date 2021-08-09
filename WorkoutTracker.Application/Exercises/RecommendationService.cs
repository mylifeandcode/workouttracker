using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorkoutTracker.Application.Exercises
{
    public abstract class RecommendationService
    {
        #region Constants
        protected const byte LOWEST_ACCEPTABLE_RATING = 4;
        #endregion Constants

        protected static bool HadAdequateRating(byte rating)
        {
            //TODO: Implement profile-based thresholds
            return rating >= LOWEST_ACCEPTABLE_RATING;
        }

    }
}
