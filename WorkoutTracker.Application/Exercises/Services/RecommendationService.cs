using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
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
        #region Enums
        protected enum Performance
        {
            Adequate,
            Bad,
            Awful
        }
        #endregion Enums

        #region Constants
        //TODO: Make these configurable instead?
        protected const byte LOWEST_ACCEPTABLE_RATING = 4;
        protected const byte HIGHEST_AWFUL_RATING = 2;
        protected const double REP_DIFFERENCE_CONSIDERED_AWFUL = 4;
        #endregion Constants

        /*
        protected static bool HadAdequateRating(byte rating)
        {
            return rating >= LOWEST_ACCEPTABLE_RATING;
        }

        protected static bool HadAdequateRating(byte rating, UserSettings userSettings)
        {
            if(userSettings == null) throw new ArgumentNullException(nameof(userSettings));
            return rating >= userSettings.LowestAcceptableRating;
        }
        */

        protected static bool HadAdequateRating(double rating, out Performance performance)
        {
            bool wasAdequate = HadAdequateRating(rating);

            if (wasAdequate)
                performance = Performance.Adequate;
            else
                performance = (rating <= HIGHEST_AWFUL_RATING ? Performance.Awful : Performance.Bad);

            return wasAdequate;
        }

        protected static bool HadAdequateRating(double rating)
        {
            return rating >= LOWEST_ACCEPTABLE_RATING;
        }

        /*
        protected static bool HadAdequateRating(double rating, UserSettings userSettings)
        {
            if (userSettings == null) throw new ArgumentNullException(nameof(userSettings));
            return rating >= userSettings.LowestAcceptableRating;
        }
        */

        protected static bool HadAdequateRating(double rating, byte lowestAcceptableRating)
        {
            return rating >= lowestAcceptableRating;
        }

        /*
        protected static bool HadAwfulRating(double rating)
        {
            return rating <= HIGHEST_AWFUL_RATING;
        }
        */

        protected static bool HadAdequateReps(
            double targetReps,
            double actualReps, 
            double differenceConsideredAwful,
            out Performance performance)
        {
            bool wasAdequate = actualReps >= targetReps;

            if (wasAdequate)
                performance = Performance.Adequate;
            else
            {
                var difference = targetReps - actualReps;
                performance = difference >= differenceConsideredAwful ? Performance.Awful : Performance.Bad;
            }

            return wasAdequate;
        }

        protected static Performance GetRatingPerformance(double rating)
        {
            bool wasAdequate = HadAdequateRating(rating);

            if (wasAdequate)
                return Performance.Adequate;
            else
                return (rating <= HIGHEST_AWFUL_RATING ? Performance.Awful : Performance.Bad);
        }

        protected static Performance GetRepPerformance(
            double targetReps,
            double actualReps,
            double differenceConsideredAwful)
        {
            bool wasAdequate = actualReps >= targetReps;

            if (wasAdequate)
                return Performance.Adequate;
            else
            {
                var difference = targetReps - actualReps;
                return difference >= differenceConsideredAwful ? Performance.Awful : Performance.Bad;
            }
        }
    }
}
