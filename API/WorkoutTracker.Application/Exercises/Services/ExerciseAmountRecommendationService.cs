using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.Application.Resistances.Interfaces;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Application.Exercises.Services
{
    /// <summary>
    /// A service for producing ExerciseAmountRecommendations.
    /// This is the entry point for recommendations. 
    /// The IIncreaseRecommendationService and IAdjustmentRecommendationService are then used 
    /// depending on whether an increase or adjustment is needed.
    /// </summary>
    public class ExerciseAmountRecommendationService : RecommendationService, IExerciseAmountRecommendationService
    {
        //TODO: Create 2 new classes to inject into this one: 1 for Timed Sets, the other for Repitition Sets

        private IResistanceBandService _resistanceBandService;
        private IIncreaseRecommendationService _increaseRecommendationService;
        private IAdjustmentRecommendationService _adjustmentRecommendationService;

        private static TimeSpan RECENTLY_PERFORMED_EXERCISE_THRESHOLD = new TimeSpan(14, 0, 0, 0);

        #region Constants
        private const byte RATING_BAD = 1;
        private const byte RATING_POOR = 2;
        private const byte RATING_OK = 3;
        #endregion Constants

        public ExerciseAmountRecommendationService(
            IResistanceBandService resistanceBandService,
            IIncreaseRecommendationService increaseRecommendationService,
            IAdjustmentRecommendationService adjustmentRecommendationService, 
            ILogger<ExerciseAmountRecommendationService> logger) : base(logger)
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
            UserSettings userSettings)
        {
            if (exercise == null)
                throw new ArgumentNullException(nameof(exercise));

            if (userSettings == null)
                throw new ArgumentNullException(nameof(userSettings));

            var lastSetsOfThisExercise = GetLastSetsOfExercise(exercise.Id, lastWorkoutWithThisExercise);

            if (UserHasPerformedExerciseBefore(lastWorkoutWithThisExercise))
            {
                if (UserHasPerformedExerciseRecently(lastSetsOfThisExercise))
                {
                    //Adjust weights or reps accordingly
                    _logger.LogInformation($"Getting performance-based recommendation for {exercise.Name}.");
                    return GetPerformanceBasedRecommendation(lastSetsOfThisExercise, userSettings);
                }
                else
                {
                    //Recommend same as last time, or lower weights or rep if they 
                    //did poorly
                    _logger.LogInformation($"Getting not-performed-recently recommendation for {exercise.Name}.");
                    return GetRecommendationForExerciseNotPerformedRecently(lastSetsOfThisExercise, userSettings);
                }
            }
            else
            {
                //Exercise never performed. Start with the default recommendation values.
                _logger.LogInformation($"Getting default recommendation for {exercise.Name} because it has never been performed.");
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
                    throw new ApplicationException($"Unhandled ResistanceType: {exercise.ResistanceType}.");
            }

            _logger.LogInformation($"Default recommendation for {exercise.Name} is {recommendation.ResistanceAmount}.");
            return recommendation;
        }

        private ExerciseAmountRecommendation GetPerformanceBasedRecommendation(
            List<ExecutedExercise> executedExercises,
            UserSettings userSettings)
        {
            var averages = new ExecutedExerciseAverages(executedExercises);

            if (ExercisePerformanceNeedsImprovement(averages, userSettings.LowestAcceptableRating))
            {
                return _adjustmentRecommendationService.GetAdjustmentRecommendation(averages, userSettings);
            }
            else
            {
                return _increaseRecommendationService.GetIncreaseRecommendation(averages, userSettings);
            }
        }

        private ExerciseAmountRecommendation GetRecommendationForExerciseNotPerformedRecently(
            List<ExecutedExercise> executedExercises,
            UserSettings userSettings)
        {
            var averages = new ExecutedExerciseAverages(executedExercises);

            //How did they do last time?
            if (ExercisePerformanceNeedsImprovement(averages, userSettings.LowestAcceptableRating))
            {
                //They didn't do well enough last time. Suggest an adjustment.
                _logger.LogInformation($"{averages.Exercise.Name} needs improvement.");
                return _adjustmentRecommendationService.GetAdjustmentRecommendation(averages, userSettings);
            }
            else
            {
                //They did well enough last time, but since they haven't done this one
                //recently, have them do what they did last time.
                _logger.LogInformation($"{averages.Exercise.Name} performed okay last time, but it's been a while, so suggesting same resistance and reps.");
                return new ExerciseAmountRecommendation(averages, "Last time for this workout was not recent.");
            }
        }
        #endregion Private Non-Static Methods

        #region Private Static Methods
        private static bool ExercisePerformanceNeedsImprovement(
            ExecutedExerciseAverages averages, 
            byte lowestAcceptableRating)
        {
            return (!HadAdequateRating(averages.AverageFormRating, lowestAcceptableRating)
                || !HadAdequateRating(averages.AverageRangeOfMotionRating, lowestAcceptableRating)
                || averages.AverageActualRepCount < averages.AverageTargetRepCount);
        }

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

        private static bool UserHasPerformedExerciseBefore(ExecutedWorkout workout)
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

        #endregion Private Static Methods

    }
}
