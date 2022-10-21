using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.Application.Resistances.Interfaces;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Application.Exercises.Services
{
    //TODO: Create two versions of this: One for Repetition Sets, one for Timed Sets
    
    /// <summary>
    /// A service to provide an adjustment recommendation for an exercise.
    /// This adjustment is not an *increase*, but rather an adjustment, in reps, resistance, or both.
    /// </summary>
    public class AdjustmentRecommendationService : RecommendationService, IAdjustmentRecommendationService
    {
        private IResistanceBandService _resistanceBandService;
        private IResistanceService _resistanceService;
        private ILogger _logger;

        private const string REASON_FORM = "Form needs improvement. ";
        private const string REASON_RANGE_OF_MOTION = "Range of Motion needs improvement. ";
        private const string REASON_FORM_AND_RANGE_OF_MOTION = "Form and Range of Motion need improvement. ";
        private const string REASON_REPS_LESS_THAN_TARGET = "Actual reps last time less than target";
        private const string REASON_REPS_MUCH_LESS_THAN_TARGET = "Actual reps last time significantly less than target.";

        public AdjustmentRecommendationService(IResistanceBandService resistanceBandService, IResistanceService resistanceService, ILogger<AdjustmentRecommendationService> logger)
        {
            _resistanceBandService = resistanceBandService ?? throw new ArgumentNullException(nameof(resistanceBandService));
            _resistanceService = resistanceService ?? throw new ArgumentNullException(nameof(resistanceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logger.LogInformation("AdjustmentRecommendationService constructed");
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

            bool inadequateForm = !HadAdequateRating(executedExerciseAverages.AverageFormRating);
            bool inadequateRangeOfMotion = !HadAdequateRating(executedExerciseAverages.AverageRangeOfMotionRating);
            bool actualRepsSignificantlyLessThanTarget = ActualRepsSignificantlyLessThanTarget(executedExerciseAverages.SetType, executedExerciseAverages.AverageTargetRepCount, executedExerciseAverages.AverageActualRepCount);
            bool actualRepsLessThanTarget = ActualRepsLessThanTarget(executedExerciseAverages.SetType, executedExerciseAverages.AverageTargetRepCount, executedExerciseAverages.AverageActualRepCount);

            if (inadequateForm || inadequateRangeOfMotion || actualRepsSignificantlyLessThanTarget || actualRepsLessThanTarget)
            {
                recommendation =
                    GetDecreaseRecommendation(
                        executedExerciseAverages,
                        userSettings,
                        inadequateForm,
                        inadequateRangeOfMotion,
                        actualRepsSignificantlyLessThanTarget,
                        actualRepsLessThanTarget);
            }
            else
            {
                //TODO: Fix! We did okay, so....what now?
                recommendation = new ExerciseAmountRecommendation();
                recommendation.Reason = "UNKNOWN";
            }

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
            UserSettings userSettings,
            bool inadequateForm,
            bool inadequateRangeOfMotion,
            bool actualRepsSignificantlyLessThanTarget,
            bool actualRepsLessThanTarget)
        {
            /*
            If form and/or range of motion were inadequate, lower resistance.
            If reps were less than target, decrease target.
            */

            bool recommendingDecreasedResistance = false;

            //var recommendation = new ExerciseAmountRecommendation(executedExerciseAverages);
            var recommendation = new ExerciseAmountRecommendation();
            if (inadequateForm || inadequateRangeOfMotion) //Because we have both, we can make this more granular later if need be
            {
                //Their form or range of motion wasn't so great, so let's bump down the resistance

                recommendingDecreasedResistance = true;
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

            if (ShouldRepCountBeLowered(actualRepsLessThanTarget, recommendingDecreasedResistance, actualRepsSignificantlyLessThanTarget))
                recommendation.Reps =
                    GetDecreasedRepCount(
                        executedExerciseAverages.SetType,
                        executedExerciseAverages.AverageTargetRepCount,
                        executedExerciseAverages.AverageActualRepCount,
                        actualRepsSignificantlyLessThanTarget);
            else
                recommendation.Reps = executedExerciseAverages.LastExecutedSet.TargetRepCount;

            recommendation.Reason = 
                GetRecommendationReason(
                    inadequateForm, 
                    inadequateRangeOfMotion,
                    actualRepsSignificantlyLessThanTarget, 
                    actualRepsLessThanTarget);

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
            double actualRepsLastTime, 
            bool significantlyLessLastTime)
        {
            if (setType == SetType.Repetition)
            {
                if (significantlyLessLastTime)
                    return (byte)(targetRepsLastTime - 10);
                else
                    return (byte)(actualRepsLastTime + 5);
            }
            else
            {
                if (significantlyLessLastTime)
                    return (byte)(targetRepsLastTime - 5);
                else
                    return (byte)(actualRepsLastTime + 2);
            }
        }

        private static string GetRecommendationReason(
            bool inadequateForm,
            bool inadequateRangeOfMotion,
            bool actualRepsSignificantlyLessThanTarget,
            bool actualRepsLessThanTarget)
        {
            string formAndRangeOfMotion;
            string reps;

            if (inadequateForm && inadequateRangeOfMotion)
                formAndRangeOfMotion = REASON_FORM_AND_RANGE_OF_MOTION;
            else if (inadequateForm)
                formAndRangeOfMotion = REASON_FORM;
            else if (inadequateRangeOfMotion)
                formAndRangeOfMotion = REASON_RANGE_OF_MOTION;
            else
                formAndRangeOfMotion = "";

            if (actualRepsSignificantlyLessThanTarget)
                reps = REASON_REPS_MUCH_LESS_THAN_TARGET;
            else if (actualRepsLessThanTarget)
                reps = REASON_REPS_LESS_THAN_TARGET;
            else
                reps = "";
            
            return $"{formAndRangeOfMotion}{reps}".TrimEnd();
        }

        #endregion Private Static Methods
    }
}
