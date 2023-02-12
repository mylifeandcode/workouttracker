using System;
using System.Linq;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using Castle.Core.Logging;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Application.Exercises.Services
{
    /// <summary>
    /// A service to provide an increase recommendation for an exercise.
    /// The increase can be in reps, resistance, or both.
    /// </summary>
    public class IncreaseRecommendationService : IIncreaseRecommendationService
    {
        private IResistanceService _resistanceService;
        private ILogger<IncreaseRecommendationService> _logger;

        public IncreaseRecommendationService(IResistanceService resistanceService, ILogger<IncreaseRecommendationService> logger)
        {
            _resistanceService = resistanceService ?? throw new ArgumentNullException(nameof(resistanceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region Public Methods
        public ExerciseAmountRecommendation GetIncreaseRecommendation(
            ExecutedExerciseAverages executedExerciseAverages,
            UserSettings userSettings)
        {
            if (executedExerciseAverages == null) throw new ArgumentNullException(nameof(executedExerciseAverages));
            if (userSettings == null) throw new ArgumentNullException(nameof(userSettings));

            var repSettings = userSettings.RepSettings.First(x => x.SetType == executedExerciseAverages.SetType);
            var recommendation = new ExerciseAmountRecommendation();

            if (executedExerciseAverages.Exercise.ResistanceType != ResistanceType.BodyWeight && executedExerciseAverages.AverageActualRepCount >= repSettings.MaxReps)
            {
                //Increase resistance
                string resistanceMakeup;
                recommendation.Reps = repSettings.MinReps;
                recommendation.ResistanceAmount =
                    GetIncreasedResistanceAmount(
                        executedExerciseAverages.AverageTargetRepCount,
                        executedExerciseAverages.AverageActualRepCount,
                        executedExerciseAverages.AverageResistanceAmount,
                        executedExerciseAverages.Exercise,
                        out resistanceMakeup);
                recommendation.ResistanceMakeup = resistanceMakeup;
                recommendation.Reason = "Met max rep count.";
            }
            else
            {
                //Increase reps
                recommendation.Reps =
                    GetIncreasedTargetRepCount(
                        executedExerciseAverages.AverageTargetRepCount,
                        executedExerciseAverages.AverageActualRepCount,
                        repSettings.MaxReps, 
                        executedExerciseAverages.Exercise.ResistanceType != ResistanceType.BodyWeight);

                recommendation.ResistanceAmount = executedExerciseAverages.LastExecutedSet.ResistanceAmount;
                recommendation.ResistanceMakeup = executedExerciseAverages.LastExecutedSet.ResistanceMakeup; //TODO: Add constructor to recommendation to default this stuff from an ExecutedExercise
                recommendation.Reason = "Good rep count.";
            }

            return recommendation;
        }
        #endregion Public Methods

        #region Private Non-Static Methods

        private decimal GetIncreasedResistanceAmount(
            double targetRepsLastTime,
            double actualRepsLastTime,
            decimal previousResistanceAmount,
            Exercise exercise,
            out string resistanceMakeup)
        {
            resistanceMakeup = null; //Only needed for resistance bands.

            if (exercise.ResistanceType == ResistanceType.BodyWeight || exercise.ResistanceType == ResistanceType.Other)
                return previousResistanceAmount;

            sbyte multiplier = GetResistanceMultiplier(targetRepsLastTime, actualRepsLastTime);

            return _resistanceService.GetNewResistanceAmount(
                exercise.ResistanceType, 
                previousResistanceAmount, 
                multiplier, 
                !exercise.OneSided, 
                out resistanceMakeup);
        }

        #endregion Private Non-Static Methods

        #region Private Static Methods
        private static sbyte GetResistanceMultiplier(double targetRepsLastTime, double actualRepsLastTime)
        {
            if (UserGreatlyExceededTargetRepCount(targetRepsLastTime, actualRepsLastTime))
            {
                return 3;
            }
            else if (UserExceededTargetRepCount(targetRepsLastTime, actualRepsLastTime))
            {
                return 2;
            }
            else
            {
                return 1;
            }
        }

        private static byte GetIncreasedTargetRepCount(
            double targetRepsLastTime,
            double actualRepsLastTime,
            byte maxRepCount, 
            bool considerMaxRepsLimit)
        {
            double increasedRepCount = actualRepsLastTime;

            /*
            if (UserGreatlyExceededTargetRepCount(targetRepsLastTime, actualRepsLastTime))
            {
                increasedRepCount += 4;
            }
            else
            {
                increasedRepCount += 1;
            }
            */

            increasedRepCount += 1;

            //Return whichever is lower -- increasedRepCount or maxRepCount -- to ensure we don't surpass the max
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
