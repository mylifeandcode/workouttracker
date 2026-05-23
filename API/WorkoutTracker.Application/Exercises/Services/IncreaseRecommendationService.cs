using System;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Application.Exercises.Services
{
    public class IncreaseRecommendationService : IIncreaseRecommendationService
    {
        private IResistanceService _resistanceService;
        private ILogger<IncreaseRecommendationService> _logger;

        public IncreaseRecommendationService(IResistanceService resistanceService, ILogger<IncreaseRecommendationService> logger)
        {
            _resistanceService = resistanceService ?? throw new ArgumentNullException(nameof(resistanceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ExerciseAmountRecommendation> GetIncreaseRecommendationAsync(
            ExecutedExerciseAverages executedExerciseAverages,
            UserSettings userSettings)
        {
            if (executedExerciseAverages == null) throw new ArgumentNullException(nameof(executedExerciseAverages));
            if (userSettings == null) throw new ArgumentNullException(nameof(userSettings));

            var repSettings = userSettings.RepSettings.First(x => x.SetType == executedExerciseAverages.SetType);
            var recommendation = new ExerciseAmountRecommendation();

            if (executedExerciseAverages.Exercise.ResistanceType != ResistanceType.BodyWeight && executedExerciseAverages.AverageActualRepCount >= repSettings.MaxReps)
            {
                recommendation.Reps = repSettings.MinReps;
                var (amount, makeup) = await GetIncreasedResistanceAmountAsync(
                    executedExerciseAverages.AverageTargetRepCount,
                    executedExerciseAverages.AverageActualRepCount,
                    executedExerciseAverages.AverageResistanceAmount,
                    executedExerciseAverages.Exercise);
                recommendation.ResistanceAmount = amount;
                recommendation.ResistanceMakeup = makeup;
                recommendation.Reason = "Met max rep count.";
            }
            else
            {
                recommendation.Reps =
                    GetIncreasedTargetRepCount(
                        executedExerciseAverages.AverageTargetRepCount,
                        executedExerciseAverages.AverageActualRepCount,
                        repSettings.MaxReps,
                        executedExerciseAverages.Exercise.ResistanceType != ResistanceType.BodyWeight);

                recommendation.ResistanceAmount = executedExerciseAverages.LastExecutedSet.ResistanceAmount;
                recommendation.ResistanceMakeup = executedExerciseAverages.LastExecutedSet.ResistanceMakeup;
                recommendation.Reason = "Good rep count.";
            }

            return recommendation;
        }

        #region Private Non-Static Methods

        private async Task<(decimal Amount, string? Makeup)> GetIncreasedResistanceAmountAsync(
            double targetRepsLastTime,
            double actualRepsLastTime,
            decimal previousResistanceAmount,
            Exercise exercise)
        {
            if (exercise.ResistanceType == ResistanceType.BodyWeight || exercise.ResistanceType == ResistanceType.Other)
                return (previousResistanceAmount, null);

            sbyte multiplier = GetResistanceMultiplier(targetRepsLastTime, actualRepsLastTime);

            return await _resistanceService.GetNewResistanceAmountAsync(
                exercise.ResistanceType,
                previousResistanceAmount,
                multiplier,
                !exercise.OneSided,
                exercise.UsesBilateralResistance);
        }

        #endregion Private Non-Static Methods

        #region Private Static Methods

        private static sbyte GetResistanceMultiplier(double targetRepsLastTime, double actualRepsLastTime)
        {
            if (UserGreatlyExceededTargetRepCount(targetRepsLastTime, actualRepsLastTime))
                return 3;
            else if (UserExceededTargetRepCount(targetRepsLastTime, actualRepsLastTime))
                return 2;
            else
                return 1;
        }

        private static byte GetIncreasedTargetRepCount(
            double targetRepsLastTime,
            double actualRepsLastTime,
            byte maxRepCount,
            bool considerMaxRepsLimit)
        {
            double increasedRepCount = actualRepsLastTime + 1;

            if (!considerMaxRepsLimit)
                return (byte)increasedRepCount;

            return (byte)Math.Min(increasedRepCount, maxRepCount);
        }

        private static bool UserGreatlyExceededTargetRepCount(double targetRepCount, double actualRepCount)
        {
            return actualRepCount - targetRepCount >= 3;
        }

        private static bool UserExceededTargetRepCount(double targetRepCount, double actualRepCount)
        {
            return actualRepCount - targetRepCount >= 1;
        }

        #endregion Private Static Methods
    }
}
