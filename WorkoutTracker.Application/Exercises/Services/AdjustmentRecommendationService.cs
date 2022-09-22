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

        public AdjustmentRecommendationService(IResistanceBandService resistanceBandService, IResistanceService resistanceService)
        {
            _resistanceBandService = resistanceBandService ?? throw new ArgumentNullException(nameof(resistanceBandService));
            _resistanceService = resistanceService ?? throw new ArgumentNullException(nameof(resistanceService));
        }

        /// <summary>
        /// Provides an adjustment recommendation for an exercise. This adjustment will suggest to decrease 
        /// the resistance amount and/or target reps.
        /// </summary>
        /// <param name="executedExercise">The exercise which needs adjustment</param>
        /// <param name="userSettings">The user's settings</param>
        /// <returns>An ExerciseAmountRecommendation with recommendations regarding reps and resistance</returns>
        public ExerciseAmountRecommendation GetAdjustmentRecommendation(
            ExecutedExercise executedExercise,
            UserSettings userSettings)
        {
            //Adjust target reps, resistance, or both.

            if (executedExercise == null) throw new ArgumentNullException(nameof(executedExercise));
            if (userSettings == null) throw new ArgumentNullException(nameof(userSettings));

            ExerciseAmountRecommendation recommendation;

            bool inadequateForm = !HadAdequateRating(executedExercise.FormRating);
            bool inadequateRangeOfMotion = !HadAdequateRating(executedExercise.RangeOfMotionRating);
            bool actualRepsSignificantlyLessThanTarget = ActualRepsSignificantlyLessThanTarget(executedExercise.SetType, executedExercise.TargetRepCount, executedExercise.ActualRepCount);
            bool actualRepsLessThanTarget = ActualRepsLessThanTarget(executedExercise.SetType, executedExercise.TargetRepCount, executedExercise.ActualRepCount);

            //If form or range of motion was lacking, reduce resistance.
            if (inadequateForm || inadequateRangeOfMotion || actualRepsSignificantlyLessThanTarget || actualRepsLessThanTarget)
            {
                recommendation =
                    GetDecreaseRecommendation(
                        executedExercise,
                        userSettings,
                        inadequateForm,
                        inadequateRangeOfMotion,
                        actualRepsSignificantlyLessThanTarget,
                        actualRepsLessThanTarget);
            }
            //Otherwise, they didn't meet their goals last time, but they should remain the same.
            else
            {
                recommendation = new ExerciseAmountRecommendation(executedExercise);
                recommendation.Reason = "";
            }

            return recommendation;
        }

        #region Private Non-Static Methods
        /// <summary>
        /// Gets a recommendation to decrease something about an exercise.
        /// </summary>
        /// <param name="executedExercise">The exercise which was executed and needs a decrease in reps or resistance</param>
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
            ExecutedExercise executedExercise,
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

            var recommendation = new ExerciseAmountRecommendation(executedExercise);
            if (inadequateForm || inadequateRangeOfMotion) //Because we have both, we can make this more granular later if need be
            {
                //Their form or range of motion wasn't so great, so let's bump down the resistance

                recommendingDecreasedResistance = true;
                recommendation.ResistanceAmount =
                    GetDecreasedResistanceAmount(
                        executedExercise.SetType,
                        executedExercise.TargetRepCount,
                        executedExercise.ActualRepCount,
                        executedExercise.ResistanceAmount,
                        executedExercise.Exercise,
                        out var resistanceMakeup);
                recommendation.ResistanceMakeup = resistanceMakeup;
            }

            if (ShouldRepCountBeLowered(actualRepsLessThanTarget, recommendingDecreasedResistance, actualRepsSignificantlyLessThanTarget))
                recommendation.Reps = 
                    GetDecreasedRepCount(
                        executedExercise.SetType, 
                        userSettings, 
                        executedExercise.TargetRepCount, 
                        executedExercise.ActualRepCount, 
                        actualRepsSignificantlyLessThanTarget);

            recommendation.Reason = 
                GetRecommendationReason(
                    inadequateForm, 
                    inadequateRangeOfMotion,
                    actualRepsSignificantlyLessThanTarget, 
                    actualRepsLessThanTarget);

            return recommendation;
        }

        #region Remove...maybe
        /*
        /// <summary>
        /// Gets a recommendation to decrease something about an exercise performed during a timed set
        /// </summary>
        /// <param name="executedExercise">The exercise which was executed and needs a decrease in reps or resistance</param>
        /// <param name="userSettings">The user's settings</param>
        /// <param name="inadequateForm">Indicates whether or not the exercise was last performed with inadequate form</param>
        /// <param name="inadequateRangeOfMotion">Indicates whether or not the exercise was last performed with inadequate range of motion</param>
        /// <param name="actualRepsSignificantlyLessThanTarget">Indicates whether or not the exercise was last performed with significantly less reps that targeted</param>
        /// <param name="actualRepsLessThanTarget">Indicates whether or not the exercise was last performed with less reps that targeted</param>
        /// <returns>An ExerciseAmountRecommendation with recommendations regarding reps and resistance for an exercise performed in a timed set</returns>
        private ExerciseAmountRecommendation GetTimedSetDecreaseRecommendation(
            ExecutedExercise executedExercise,
            UserSettings userSettings,
            bool inadequateForm,
            bool inadequateRangeOfMotion,
            bool actualRepsSignificantlyLessThanTarget,
            bool actualRepsLessThanTarget)
        {
            string resistanceMakeup;
            bool recommendingDecreasedResistance = false;

            var recommendation = new ExerciseAmountRecommendation(executedExercise);
            if (inadequateForm || inadequateRangeOfMotion) //Because we have both, we can make this more granular later if need be
            {
                recommendingDecreasedResistance = true;
                recommendation.ResistanceAmount =
                    GetDecreasedResistanceAmount(
                        SetType.Timed, 
                        executedExercise.TargetRepCount, 
                        executedExercise.ActualRepCount, 
                        executedExercise.ResistanceAmount, 
                        executedExercise.Exercise, 
                        out resistanceMakeup);
                recommendation.ResistanceMakeup = resistanceMakeup;
            }

            if (ShouldRepCountBeLowered(actualRepsLessThanTarget, recommendingDecreasedResistance, actualRepsSignificantlyLessThanTarget))
                recommendation.Reps = GetDecreasedRepCount(SetType.Timed, userSettings, executedExercise.TargetRepCount, executedExercise.ActualRepCount);

            return recommendation;
        }

        private ExerciseAmountRecommendation GetRepititionSetDecreaseRecommendation(
            ExecutedExercise executedExercise,
            UserSettings userSettings,
            bool inadequateForm,
            bool inadequateRangeOfMotion,
            bool actualRepsSignificantlyLessThanTarget,
            bool actualRepsLessThanTarget)
        {
            throw new NotImplementedException();
        }
        */
        #endregion Remove...maybe
        
        private decimal GetDecreasedResistanceAmount(
            SetType setType,
            byte targetRepsLastTime,
            byte actualRepsLastTime,
            decimal previousResistanceAmount,
            Exercise exercise,
            out string resistanceMakeup)
        {
            resistanceMakeup = null; //Only needed for resistance bands.

            sbyte multiplier = GetRepCountMultiplier(setType, targetRepsLastTime, actualRepsLastTime);
            decimal resistanceAmount = 0;

            resistanceAmount = 
                _resistanceService.GetNewResistanceAmount(
                    exercise.ResistanceType,
                    previousResistanceAmount, 
                    multiplier, 
                    !exercise.OneSided, 
                    out resistanceMakeup);

            return resistanceAmount;
        }


        #endregion Private Non-Static Methods

        #region Private Static Methods
        private static bool ActualRepsSignificantlyLessThanTarget(
            SetType setType,
            byte targetReps,
            byte actualReps)
        {
            //TODO: Allow this to be configurable
            if (setType == SetType.Repetition)
                return (targetReps - actualReps) >= 10;
            else
                return (targetReps - actualReps) >= 5;
        }

        private static bool ActualRepsLessThanTarget(
            SetType setType,
            byte targetReps,
            byte actualReps)
        {
            //TODO: Allow this to be configurable
            byte difference = (byte)(targetReps - actualReps);

            if (setType == SetType.Repetition)
            {
                return difference < 10 && difference >= 1;
            }
            else
            {
                return difference < 5 && difference >= 1;
            }
        }

        private static sbyte GetRepCountMultiplier(SetType setType, byte targetRepsLastTime, byte actualRepsLastTime)
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
            UserSettings userSettings,
            byte targetRepsLastTime,
            byte actualRepsLastTime, 
            bool significantlyLessLastTime)
        {
            //TODO: Use UserSettings to adjust by goal type
            
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
                formAndRangeOfMotion = "Form and Range of Motion need improvement. ";
            else if (inadequateForm)
                formAndRangeOfMotion = "Form needs improvement. ";
            else if (inadequateRangeOfMotion)
                formAndRangeOfMotion = "Range of Motion needs improvement. ";
            else
                formAndRangeOfMotion = "";

            if (actualRepsSignificantlyLessThanTarget)
                reps = "Actual reps last time significantly less than target.";
            else if (actualRepsLessThanTarget)
                reps = "Actual reps last time less than target.";
            else
                reps = "";
            
            return $"{formAndRangeOfMotion}{reps}".TrimEnd();
        }

        #endregion Private Static Methods
    }
}
