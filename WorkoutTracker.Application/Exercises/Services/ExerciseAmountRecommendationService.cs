using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.Application.Resistances.Interfaces;

namespace WorkoutTracker.Application.Exercises.Services
{
    /// <summary>
    /// A service for producing ExerciseAmountRecommendations
    /// </summary>
    public class ExerciseAmountRecommendationService : RecommendationService, IExerciseAmountRecommendationService
    {
        //TODO: Create 2 new classes to inject into this one: 1 for Timed Sets, the other for Repitition Sets

        private IResistanceBandService _resistanceBandService;
        private IIncreaseRecommendationService _increaseRecommendationService;
        private IAdjustmentRecommendationService _adjustmentRecommendationService;

        private static TimeSpan RECENTLY_PERFORMED_EXERCISE_THRESHOLD = new TimeSpan(14, 0, 0, 0);

        #region Constants
        private const string REASON_FORM_NEEDS_IMPROVEMENT = "Form needs improvement.";
        private const string REASON_RANGE_OF_MOTION_NEEDS_IMPROVEMENT = "Range of Motion needs improvement.";
        private const string REASON_ACTUAL_REPS_SIGNIFICANTLY_LOWER_THAN_TARGET = "Actual reps last time were significantly lower than target.";
        private const string REASON_ACTUAL_REPS_LOWER_THAN_TARGET = "Actual reps last time lower than target.";
        private const string REASON_GOALS_NOT_MET_BUT_CLOSE = "Goals not met, but close enough to remain the same.";

        private const byte RATING_BAD = 1;
        private const byte RATING_POOR = 2;
        private const byte RATING_OK = 3;
        #endregion Constants

        public ExerciseAmountRecommendationService(
            IResistanceBandService resistanceBandService,
            IIncreaseRecommendationService increaseRecommendationService,
            IAdjustmentRecommendationService adjustmentRecommendationService)
        {
            _resistanceBandService = resistanceBandService ?? throw new ArgumentNullException(nameof(resistanceBandService));
            _increaseRecommendationService = increaseRecommendationService ?? throw new ArgumentNullException(nameof(increaseRecommendationService));
            _adjustmentRecommendationService = adjustmentRecommendationService ?? throw new ArgumentNullException(nameof(adjustmentRecommendationService));
        }

        #region Public Methods

        /// <summary>
        /// Gets an ExerciseAmountRecommendation for an exercise based on previous performance or lack thereof
        /// </summary>
        /// <param name="exercise">The Exercise to get an ExerciseAmountRecommendation for</param>
        /// <param name="lastWorkoutWithThisExercise">The last ExecutedWorkout containing the Exercise to get a recommendation for</param>
        /// <param name="userSettings">The settings for the user requesting the recommendation</param>
        /// <returns>An ExerciseAmountRecommendation for the specified Exercise</returns>
        public ExerciseAmountRecommendation GetRecommendation(
            Exercise exercise,
            ExecutedWorkout lastWorkoutWithThisExercise,
            UserSettings userSettings = null)
        {
            if (exercise == null)
                throw new ArgumentNullException(nameof(exercise));

            var lastSetsOfThisExercise = GetLastSetsOfExercise(exercise.Id, lastWorkoutWithThisExercise);

            if (userSettings == null)
                userSettings = UserSettings.GetDefault(); //TODO: Remove stopgap.

            if (UserHasPerformedExeriseBefore(lastWorkoutWithThisExercise))
            {
                if (UserHasPerformedExerciseRecently(lastSetsOfThisExercise))
                {
                    //Adjust weights or reps accordingly
                    return GetPerformanceBasedRecommendation(lastSetsOfThisExercise, userSettings);
                }
                else
                {
                    //Recommend same as last time, or lower weights or rep if they 
                    //did poorly
                    return GetRecommendationForExerciseNotPerformedRecently(lastSetsOfThisExercise, userSettings);
                }
            }
            else
            {
                //Exercise never performed. Start with the default recommendation values.
                return GetDefaultRecommendation(exercise);
            }
        }

        #endregion Public Methods

        #region Private Non-Static Methods

        private ExerciseAmountRecommendation GetDefaultRecommendation(
            Exercise exercise)
        {
            var recommendation = new ExerciseAmountRecommendation();
            recommendation.ExerciseId = exercise.Id;
            recommendation.Reps = 10; //TODO: Tailor to user's goals (bulk, weight loss, etc)
            recommendation.Reason = "Exercise has never been performed. Starting recommendation at lowest resistance.";

            switch (exercise.ResistanceType)
            {
                case ResistanceType.BodyWeight:
                    break;

                case ResistanceType.FreeWeight:
                    recommendation.ResistanceAmount = 5; //TODO: Get lowest available free-weight value
                    break;

                case ResistanceType.MachineWeight:
                    recommendation.ResistanceAmount = 10; //TODO: Get lowest available machine weight value
                    break;

                case ResistanceType.ResistanceBand:
                    recommendation.ResistanceAmount = _resistanceBandService.GetLowestResistanceBand().MaxResistanceAmount;
                    break;

                case ResistanceType.Other:
                    recommendation.ResistanceAmount = 5;
                    break;

                default:
                    throw new ApplicationException($"Unhandled ResistanceType: {exercise.ResistanceType.ToString()}.");
            }

            return recommendation;
        }

        private ExerciseAmountRecommendation GetPerformanceBasedRecommendation(
            List<ExecutedExercise> executedExercises,
            UserSettings userSettings)
        {
            //TODO: Allow for profile-based thresholds
            var firstExerciseSet = GetFirstExerciseBySequence(executedExercises);
            if (firstExerciseSet.ActualRepCount >= firstExerciseSet.TargetRepCount)
            {
                if (HadAdequateRating(firstExerciseSet.FormRating)
                    && HadAdequateRating(firstExerciseSet.RangeOfMotionRating))
                {
                    return _increaseRecommendationService.GetIncreaseRecommendation(firstExerciseSet, userSettings);
                }
                else
                {
                    return _adjustmentRecommendationService.GetAdjustmentRecommendation(firstExerciseSet, userSettings);
                }
            }
            else
            {
                return _adjustmentRecommendationService.GetAdjustmentRecommendation(firstExerciseSet, userSettings);
            }
        }

        private ExerciseAmountRecommendation GetRecommendationForExerciseNotPerformedRecently(
            List<ExecutedExercise> executedExercises,
            UserSettings userSettings)
        {
            var firstExerciseOfSet = GetFirstExerciseBySequence(executedExercises);

            //How did they do last time?
            if (HadAdequateRating(firstExerciseOfSet.FormRating)
                && HadAdequateRating(firstExerciseOfSet.RangeOfMotionRating)
                && firstExerciseOfSet.ActualRepCount >= firstExerciseOfSet.TargetRepCount)
            {
                //They did well enough last time, but since they haven't done this one
                //recently, have them do what they did last time.
                var recommendation = new ExerciseAmountRecommendation();

                recommendation.ExerciseId = firstExerciseOfSet.ExerciseId;
                recommendation.Reps = firstExerciseOfSet.TargetRepCount;
                recommendation.ResistanceAmount = firstExerciseOfSet.ResistanceAmount;
                recommendation.ResistanceMakeup = firstExerciseOfSet.ResistanceMakeup;

                return recommendation;
            }
            else
            {
                return _adjustmentRecommendationService.GetAdjustmentRecommendation(firstExerciseOfSet, userSettings);
            }
        }
        #endregion Private Non-Static Methods

        #region Private Static Methods

        private static List<ExecutedExercise> GetLastSetsOfExercise(int exerciseId, ExecutedWorkout workout)
        {
            if (workout == null || workout.Exercises == null)
                return new List<ExecutedExercise>(0);
            else
                return workout
                    .Exercises
                    .Where(exercise => exercise.ExerciseId == exerciseId)
                    .ToList();
        }

        private static bool UserHasPerformedExeriseBefore(ExecutedWorkout workout)
        {
            return workout != null;
        }

        private static bool UserHasPerformedExerciseRecently(List<ExecutedExercise> executedExercises)
        {
            if (executedExercises == null || !executedExercises.Any()) //This should never happen
                return false;

            return DateTime.Now.Date
                .Subtract(
                    executedExercises
                        .OrderByDescending(exercise => exercise.Sequence)
                        .First()
                        .CreatedDateTime
                        .Date) <= RECENTLY_PERFORMED_EXERCISE_THRESHOLD;
        }

        private static ExecutedExercise GetFirstExerciseBySequence(List<ExecutedExercise> executedExercises)
        {
            return executedExercises.OrderBy(exercise => exercise.Sequence).First();
        }

        private static bool UserMetTargetRepCount(byte targetRepCount, byte actualRepCount)
        {
            //TODO: Re-evaluate. Probably not necessary -- would be the default
            //condition.
            return targetRepCount == actualRepCount;
        }

        private static string GetBadRatingReason(bool inadequateForm, bool inadequateRangeOfMotion)
        {
            if (inadequateForm && inadequateRangeOfMotion)
                return REASON_FORM_NEEDS_IMPROVEMENT + " " + REASON_RANGE_OF_MOTION_NEEDS_IMPROVEMENT;
            else if (inadequateForm)
                return REASON_FORM_NEEDS_IMPROVEMENT;
            else
                return REASON_RANGE_OF_MOTION_NEEDS_IMPROVEMENT;
        }

        private static byte GetResistanceDecreaseMultiplier(byte formRating, byte rangeOfMotionRating)
        {
            if (UserHadFormOrRangeOfMotionRating(RATING_BAD, formRating, rangeOfMotionRating))
                return 3;
            else if (UserHadFormOrRangeOfMotionRating(RATING_POOR, formRating, rangeOfMotionRating))
                return 2;
            else
                return 1;
        }

        private static bool UserHadFormOrRangeOfMotionRating(byte ratingLevel, byte formRating, byte rangeOfMotionRating)
        {
            return formRating == ratingLevel || rangeOfMotionRating == ratingLevel;
        }

        #endregion Private Static Methods

    }
}
