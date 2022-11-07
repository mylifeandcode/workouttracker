﻿using System;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace WorkoutTracker.Application.Exercises.Services
{
    //TODO: Create two versions of this: One for Repetition Sets, one for Timed Sets
    
    /// <summary>
    /// A service to provide an adjustment recommendation for an exercise.
    /// This adjustment is not an *increase*, but rather an adjustment, in reps, resistance, or both.
    /// </summary>
    public class AdjustmentRecommendationService : RecommendationService, IAdjustmentRecommendationService
    {
        private IResistanceService _resistanceService;
        private ILogger<AdjustmentRecommendationService> _logger;

        public AdjustmentRecommendationService(IResistanceService resistanceService, ILogger<AdjustmentRecommendationService> logger)
        {
            _resistanceService = resistanceService ?? throw new ArgumentNullException(nameof(resistanceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Provides an adjustment recommendation for an exercise. This adjustment will suggest to decrease 
        /// the resistance amount and/or target reps.
        /// </summary>
        /// <param name="executedExercise">The exercise which needs adjustment</param>
        /// <param name="userSettings">The user's settings</param>
        /// <returns>An ExerciseAmountRecommendation with recommendations regarding reps and resistance</returns>
        public ExerciseAmountRecommendation GetAdjustmentRecommendation(
            ExecutedExerciseAverages executedExerciseAverages,
            UserSettings userSettings)
        {
            //Adjust target reps, resistance, or both.

            if (executedExerciseAverages == null) throw new ArgumentNullException(nameof(executedExerciseAverages));
            if (userSettings == null) throw new ArgumentNullException(nameof(userSettings));

            ExerciseAmountRecommendation recommendation;

            //We already know they need improvement, but find out exactly why so we can report that
            //to the user with the recommendation.
            Performance formPerformance = GetRatingPerformance(executedExerciseAverages.AverageFormRating);
            Performance rangeOfMotionPerformance = GetRatingPerformance(executedExerciseAverages.AverageRangeOfMotionRating);
            Performance repPerformance = 
                GetRepPerformance(
                    executedExerciseAverages.AverageTargetRepCount,
                    executedExerciseAverages.AverageActualRepCount,
                    REP_DIFFERENCE_CONSIDERED_AWFUL);

            recommendation =
                GetDecreaseRecommendation(
                    executedExerciseAverages,
                    formPerformance, 
                    rangeOfMotionPerformance, 
                    repPerformance, 
                    userSettings);

            return recommendation;
        }

        #region Private Non-Static Methods
        /// <summary>
        /// Gets a recommendation to decrease something about an exercise.
        /// </summary>
        /// <param name="executedExerciseAverages">The exercise which was executed and needs a decrease in reps or resistance</param>
        /// <param name="userSettings">The user's settings</param>
        /// <param name="inadequateForm">Indicates whether or not the exercise was last performed with inadequate form</param>
        /// <param name="inadequateRangeOfMotion">Indicates whether or not the exercise was last performed with inadequate range of motion</param>
        /// <param name="actualRepsSignificantlyLessThanTarget">Indicates whether or not the exercise was last performed with significantly less reps that targeted</param>
        /// <param name="actualRepsLessThanTarget">Indicates whether or not the exercise was last performed with less reps that targeted</param>
        /// <returns>An ExerciseAmountRecommendation with recommendations regarding reps and resistance</returns>
        /// <remarks>
        /// This abstracts the differences between getting a decrease recommendation for an exercise for a
        /// timed set versus a repetition set.
        /// </remarks>
        private ExerciseAmountRecommendation GetDecreaseRecommendation(
            ExecutedExerciseAverages executedExerciseAverages,
            Performance formPerformance,
            Performance rangeOfMotionPerformance, 
            Performance repPerformance, 
            UserSettings userSettings)
        {
            /*
            If form and/or range of motion were inadequate, or rep count less than minimum, 
            lower resistance.
            If reps were less than target, decrease target rep count.
            */

            bool recommendingDecreasedResistance = 
                formPerformance != Performance.Adequate 
                || rangeOfMotionPerformance != Performance.Adequate
                || AverageActualRepCountLessThanMinimum(
                    executedExerciseAverages.AverageActualRepCount, 
                    executedExerciseAverages.SetType, 
                    userSettings);

            bool recommendingDecreasedTargetRepCount = repPerformance != Performance.Adequate;

            var recommendation = new ExerciseAmountRecommendation();

            if (recommendingDecreasedResistance)
            {
                //Their form or range of motion wasn't so great, so let's bump down the resistance
                recommendation.ResistanceAmount =
                    GetDecreasedResistanceAmount(
                        executedExerciseAverages.SetType,
                        executedExerciseAverages.AverageTargetRepCount,
                        executedExerciseAverages.AverageActualRepCount,
                        executedExerciseAverages.AverageResistanceAmount,
                        executedExerciseAverages.Exercise,
                        out var resistanceMakeup);
                recommendation.ResistanceMakeup = resistanceMakeup;
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
                        userSettings);
            else
                recommendation.Reps = executedExerciseAverages.LastExecutedSet.TargetRepCount;

            recommendation.Reason = 
                GetRecommendationReason(
                    formPerformance, 
                    rangeOfMotionPerformance,
                    repPerformance);

            return recommendation;
        }

        private decimal GetDecreasedResistanceAmount(
            SetType setType,
            double targetRepsLastTime,
            double actualRepsLastTime,
            decimal previousResistanceAmount,
            Exercise exercise,
            out string resistanceMakeup)
        {
            resistanceMakeup = null; //Only needed for resistance bands.

            sbyte multiplier = GetRepCountMultiplier(setType, targetRepsLastTime, actualRepsLastTime);
            decimal resistanceAmount = 0;

            _logger.LogInformation($"Getting decreased resistance amount for exercise {exercise.Name} (resistance type {exercise.ResistanceType}) using multiplier {multiplier}. Previous resistance: {previousResistanceAmount}.");

            resistanceAmount = 
                _resistanceService.GetNewResistanceAmount(
                    exercise.ResistanceType,
                    previousResistanceAmount, 
                    multiplier, 
                    !exercise.OneSided, 
                    out resistanceMakeup);

            _logger.LogInformation($"Decreased resistance amount for exercise {exercise.Name} is {resistanceAmount}.");

            return resistanceAmount;
        }


        #endregion Private Non-Static Methods

        #region Private Static Methods
        private static bool AverageActualRepCountLessThanMinimum(
            double averageActualRepCount, SetType setType, UserSettings userSettings)
        {
            return averageActualRepCount < userSettings.RepSettings.First(x => x.SetType == setType).MinReps;
        }


        private static bool ActualRepsSignificantlyLessThanTarget(
            SetType setType,
            double targetReps,
            double actualReps)
        {
            //TODO: Allow this to be configurable
            if (setType == SetType.Repetition)
                return (targetReps - actualReps) >= 10;
            else
                return (targetReps - actualReps) >= 5;
        }

        private static bool ActualRepsLessThanTarget(
            SetType setType,
            double targetReps,
            double actualReps)
        {
            //TODO: Allow this to be configurable
            double difference = targetReps - actualReps;

            if (setType == SetType.Repetition)
            {
                return difference < 10 && difference >= 1;
            }
            else
            {
                return difference < 5 && difference >= 1;
            }
        }

        private static sbyte GetRepCountMultiplier(SetType setType, double targetRepsLastTime, double actualRepsLastTime)
        {
            if (ActualRepsSignificantlyLessThanTarget(setType, targetRepsLastTime, actualRepsLastTime))
            {
                return -3;
            }
            else if (ActualRepsLessThanTarget(setType, targetRepsLastTime, actualRepsLastTime))
            {
                return -2;
            }
            else
            {
                return -1;
            }
        }

        private static bool ShouldRepCountBeLowered(
            bool lastRepCountLessThanTarget,
            bool recommendingResistanceBeLowered,
            bool lastRepCountSignificantlyLessThanTarget)
        {
            if (!lastRepCountLessThanTarget)
                return false;

            //This could be consolidated to a single line, but this way is more readable :)
            if (!recommendingResistanceBeLowered || (recommendingResistanceBeLowered && lastRepCountSignificantlyLessThanTarget))
                return true;
            else
                return false;
        }

        private static byte GetDecreasedRepCount(
            SetType setType,
            double targetRepsLastTime,
            Performance repPerformance, 
            UserSettings userSettings)
        {
            var repSettings = userSettings.RepSettings.First(x => x.SetType == SetType.Repetition);

            if (repPerformance == Performance.Awful)
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
            string formReason;
            string rangeOfMotionReason;
            string repReason;

            if (formPerformance == Performance.Adequate)
                formReason = "";
            else
                formReason = (formPerformance == Performance.Awful ? "Form needs much improvement. " : "Form needs improvement. ");

            if (rangeOfMotionPerformance == Performance.Adequate)
                rangeOfMotionReason = "";
            else
                rangeOfMotionReason = (rangeOfMotionPerformance == Performance.Awful ? "Range of motion needs much improvement. " : "Range of motion needs improvement. ");

            if (repPerformance == Performance.Adequate)
                repReason = "";
            else
                repReason = (repPerformance == Performance.Awful ? "Average rep count much less than target." : "Average rep count less than target.");

            return $"{formReason}{rangeOfMotionReason}{repReason}".TrimEnd();
        }

        #endregion Private Static Methods
    }
}
