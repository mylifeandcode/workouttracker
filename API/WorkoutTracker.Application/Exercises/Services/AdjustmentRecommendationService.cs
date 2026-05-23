using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Application.Exercises.Services
{
    public class AdjustmentRecommendationService : RecommendationService, IAdjustmentRecommendationService
    {
        private IResistanceService _resistanceService;

        public AdjustmentRecommendationService(IResistanceService resistanceService, ILogger<AdjustmentRecommendationService> logger) : base(logger)
        {
            _resistanceService = resistanceService ?? throw new ArgumentNullException(nameof(resistanceService));
        }

        public async Task<ExerciseAmountRecommendation> GetAdjustmentRecommendationAsync(
            ExecutedExerciseAverages executedExerciseAverages,
            UserSettings userSettings)
        {
            if (executedExerciseAverages == null) throw new ArgumentNullException(nameof(executedExerciseAverages));
            if (userSettings == null) throw new ArgumentNullException(nameof(userSettings));

            _logger.LogInformation("Getting adjustment recommendation for {Exercise}", executedExerciseAverages.Exercise.Name);

            Performance formPerformance = GetRatingPerformance(executedExerciseAverages.AverageFormRating);
            Performance rangeOfMotionPerformance = GetRatingPerformance(executedExerciseAverages.AverageRangeOfMotionRating);
            Performance repPerformance =
                GetRepPerformance(
                    executedExerciseAverages.AverageTargetRepCount,
                    executedExerciseAverages.AverageActualRepCount,
                    REP_DIFFERENCE_CONSIDERED_AWFUL);

            var recommendation = await GetDecreaseRecommendationAsync(
                executedExerciseAverages,
                formPerformance,
                rangeOfMotionPerformance,
                repPerformance,
                userSettings);

            _logger.LogInformation("Returning adjustment recommendation: Resistance = {ResistanceAmount}, Reps = {Reps}, Reason = {Reason}", recommendation.ResistanceAmount, recommendation.Reps, recommendation.Reason);

            return recommendation;
        }

        #region Private Non-Static Methods

        private async Task<ExerciseAmountRecommendation> GetDecreaseRecommendationAsync(
            ExecutedExerciseAverages executedExerciseAverages,
            Performance formPerformance,
            Performance rangeOfMotionPerformance,
            Performance repPerformance,
            UserSettings userSettings)
        {
            bool recommendingDecreasedResistance =
                SuggestDecreasedResistance(executedExerciseAverages, formPerformance, rangeOfMotionPerformance, userSettings);

            bool recommendingDecreasedTargetRepCount = repPerformance != Performance.Adequate;

            var recommendation = new ExerciseAmountRecommendation();

            if (recommendingDecreasedResistance)
            {
                var lowestPerformance = new List<Performance>() { formPerformance, rangeOfMotionPerformance, repPerformance }.Max();

                var (amount, makeup) = await GetDecreasedResistanceAmountAsync(
                    executedExerciseAverages.AverageResistanceAmount,
                    lowestPerformance,
                    executedExerciseAverages.Exercise);

                recommendation.ResistanceAmount = amount;
                recommendation.ResistanceMakeup = makeup;
            }
            else
            {
                recommendation.ResistanceAmount = executedExerciseAverages.LastExecutedSet.ResistanceAmount;
                recommendation.ResistanceMakeup = executedExerciseAverages.LastExecutedSet.ResistanceMakeup;
            }

            if (recommendingDecreasedTargetRepCount)
                recommendation.Reps =
                    GetDecreasedRepCount(
                        executedExerciseAverages.SetType,
                        executedExerciseAverages.AverageTargetRepCount,
                        repPerformance,
                        userSettings,
                        executedExerciseAverages.Exercise.ResistanceType);
            else
                recommendation.Reps = executedExerciseAverages.LastExecutedSet.TargetRepCount;

            recommendation.Reason =
                GetRecommendationReason(formPerformance, rangeOfMotionPerformance, repPerformance);

            return recommendation;
        }

        private async Task<(decimal Amount, string? Makeup)> GetDecreasedResistanceAmountAsync(
            decimal previousResistanceAmount,
            Performance lowestPreviousPerformance,
            Exercise exercise)
        {
            sbyte multiplier = GetResistanceMultiplier(lowestPreviousPerformance);

            _logger.LogInformation($"Getting decreased resistance amount for exercise {exercise.Name} (resistance type {exercise.ResistanceType}) using multiplier {multiplier}. Previous resistance: {previousResistanceAmount}.");

            var result = await _resistanceService.GetNewResistanceAmountAsync(
                exercise.ResistanceType,
                previousResistanceAmount,
                multiplier,
                !exercise.OneSided,
                exercise.UsesBilateralResistance);

            _logger.LogInformation($"Decreased resistance amount for exercise {exercise.Name} is {result.Amount}.");

            return result;
        }

        #endregion Private Non-Static Methods

        #region Private Static Methods

        private static bool AverageActualRepCountLessThanMinimum(
            double averageActualRepCount, SetType setType, UserSettings userSettings)
        {
            return averageActualRepCount < userSettings.RepSettings.First(x => x.SetType == setType).MinReps;
        }

        private static sbyte GetResistanceMultiplier(Performance previousPerformance)
        {
            switch (previousPerformance)
            {
                case Performance.Awful:
                    return -2;
                case Performance.Bad:
                    return -1;
                default:
                    return 1;
            }
        }

        private static byte GetDecreasedRepCount(
            SetType setType,
            double targetRepsLastTime,
            Performance repPerformance,
            UserSettings userSettings,
            ResistanceType resistanceType)
        {
            var repSettings = userSettings.RepSettings.First(x => x.SetType == SetType.Repetition);

            if (repPerformance == Performance.Awful && resistanceType != ResistanceType.BodyWeight)
                return repSettings.MinReps;
            else
            {
                switch (setType)
                {
                    case SetType.Repetition:
                        return (byte)Math.Max(repSettings.MinReps, Math.Ceiling(targetRepsLastTime - 1));

                    case SetType.Timed:
                        return (byte)Math.Max(repSettings.MinReps, Math.Ceiling(targetRepsLastTime - 5)); //TODO: Make configurable

                    default:
                        throw new Exception($"Unknown SetType: {setType}.");
                }
            }
        }

        private static string GetRecommendationReason(
            Performance formPerformance,
            Performance rangeOfMotionPerformance,
            Performance repPerformance)
        {
            string formReason = formPerformance == Performance.Adequate ? "" :
                (formPerformance == Performance.Awful ? "Form needs much improvement. " : "Form needs improvement. ");

            string rangeOfMotionReason = rangeOfMotionPerformance == Performance.Adequate ? "" :
                (rangeOfMotionPerformance == Performance.Awful ? "Range of motion needs much improvement. " : "Range of motion needs improvement. ");

            string repReason = repPerformance == Performance.Adequate ? "" :
                (repPerformance == Performance.Awful ? "Average rep count much less than target." : "Average rep count less than target.");

            return $"{formReason}{rangeOfMotionReason}{repReason}".TrimEnd();
        }

        private bool SuggestDecreasedResistance(
            ExecutedExerciseAverages executedExerciseAverages,
            Performance formPerformance,
            Performance rangeOfMotionPerformance,
            UserSettings userSettings)
        {
            if (executedExerciseAverages.Exercise.ResistanceType == ResistanceType.BodyWeight)
                return false;

            return formPerformance != Performance.Adequate
                || rangeOfMotionPerformance != Performance.Adequate
                || AverageActualRepCountLessThanMinimum(
                    executedExerciseAverages.AverageActualRepCount,
                    executedExerciseAverages.SetType,
                    userSettings);
        }

        #endregion Private Static Methods
    }
}
