using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.Application.Resistances.Interfaces;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Application.Exercises.Services
{
    public class ExerciseAmountRecommendationService : RecommendationService, IExerciseAmountRecommendationService
    {
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

        public async Task<ExerciseAmountRecommendation> GetRecommendationAsync(
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
                    _logger.LogInformation($"Getting performance-based recommendation for {exercise.Name}. Uses bilateral resistance = {exercise.UsesBilateralResistance}.");
                    return await GetPerformanceBasedRecommendationAsync(lastSetsOfThisExercise, userSettings);
                }
                else
                {
                    //Recommend same as last time, or lower weights or rep if they 
                    //did poorly
                    _logger.LogInformation($"Getting not-performed-recently recommendation for {exercise.Name}. Uses bilateral resistance = {exercise.UsesBilateralResistance}.");
                    return await GetRecommendationForExerciseNotPerformedRecentlyAsync(lastSetsOfThisExercise, userSettings);
                }
            }
            else
            {
                _logger.LogInformation($"Getting default recommendation for {exercise.Name} because it has never been performed.");
                return await GetDefaultRecommendationAsync(exercise);
            }
        }

        #region Private Non-Static Methods

        private async Task<ExerciseAmountRecommendation> GetDefaultRecommendationAsync(Exercise exercise)
        {
            var recommendation = new ExerciseAmountRecommendation();
            recommendation.ExerciseId = exercise.Id;
            recommendation.Reps = 10;
            recommendation.Reason = "Exercise has never been performed. Starting recommendation at lowest resistance.";

            switch (exercise.ResistanceType)
            {
                case ResistanceType.BodyWeight:
                    break;

                case ResistanceType.FreeWeight:
                    recommendation.ResistanceAmount = 5;
                    break;

                case ResistanceType.MachineWeight:
                    recommendation.ResistanceAmount = 10;
                    break;

                case ResistanceType.ResistanceBand:
                    var lowestBand = await _resistanceBandService.GetLowestResistanceBandAsync();
                    recommendation.ResistanceAmount = lowestBand?.MaxResistanceAmount ?? 0;
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

        private async Task<ExerciseAmountRecommendation> GetPerformanceBasedRecommendationAsync(
            List<ExecutedExercise> executedExercises,
            UserSettings userSettings)
        {
            var averages = new ExecutedExerciseAverages(executedExercises);

            if (ExercisePerformanceNeedsImprovement(averages, userSettings.LowestAcceptableRating))
                return await _adjustmentRecommendationService.GetAdjustmentRecommendationAsync(averages, userSettings);
            else
                return await _increaseRecommendationService.GetIncreaseRecommendationAsync(averages, userSettings);
        }

        private async Task<ExerciseAmountRecommendation> GetRecommendationForExerciseNotPerformedRecentlyAsync(
            List<ExecutedExercise> executedExercises,
            UserSettings userSettings)
        {
            var averages = new ExecutedExerciseAverages(executedExercises);

            if (ExercisePerformanceNeedsImprovement(averages, userSettings.LowestAcceptableRating))
            {
                _logger.LogInformation($"{averages.Exercise.Name} needs improvement.");
                return await _adjustmentRecommendationService.GetAdjustmentRecommendationAsync(averages, userSettings);
            }
            else
            {
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
            if (executedExercises == null || !executedExercises.Any())
                return false;

            return DateTime.Now.Date
                .Subtract(
                    executedExercises
                        .OrderByDescending(exercise => exercise.Sequence)
                        .First()
                        .CreatedDateTime
                        .Date) <= RECENTLY_PERFORMED_EXERCISE_THRESHOLD;
        }

        #endregion Private Static Methods
    }
}
