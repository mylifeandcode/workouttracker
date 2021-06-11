using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Users;

namespace WorkoutTracker.Application.Exercises
{
    public class AdjustmentRecommendationService : RecommendationService, IAdjustmentRecommendationService
    {
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
        private ExerciseAmountRecommendation GetDecreaseRecommendation(
            ExecutedExercise executedExercise,
            UserSettings userSettings,
            bool inadequateForm,
            bool inadequateRangeOfMotion,
            bool actualRepsSignificantlyLessThanTarget,
            bool actualRepsLessThanTarget)
        {
            if (executedExercise.SetType == SetType.Timed)
                return GetTimedSetDecreaseRecommendation(
                    executedExercise,
                    userSettings,
                    inadequateForm,
                    inadequateRangeOfMotion,
                    actualRepsSignificantlyLessThanTarget,
                    actualRepsLessThanTarget);
            else
                return GetRepititionSetDecreaseRecommendation(
                    executedExercise,
                    userSettings,
                    inadequateForm,
                    inadequateRangeOfMotion,
                    actualRepsSignificantlyLessThanTarget,
                    actualRepsLessThanTarget);
        }

        private ExerciseAmountRecommendation GetTimedSetDecreaseRecommendation(
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

            //TODO: Tailor to user settings
            byte multiplier = 1; //TODO: Set
            string resistanceMakeup;

            var recommendation = new ExerciseAmountRecommendation(executedExercise);
            if (inadequateForm || inadequateRangeOfMotion) //Because we have both, we can make this more granular later if need be
            {
                recommendation.ResistanceAmount =
                    GetDecreasedResistanceBandResistanceAmount(
                        executedExercise.ResistanceAmount,
                        multiplier,
                        !executedExercise.Exercise.OneSided,
                        out resistanceMakeup);
                recommendation.ResistanceMakeup = resistanceMakeup;
            }

            if (actualRepsLessThanTarget)
            {
                if (actualRepsSignificantlyLessThanTarget)
                {
                }
                else
                {
                }
            }

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

        private decimal GetDecreasedResistanceAmount(
            SetType setType,
            byte targetRepsLastTime,
            byte actualRepsLastTime,
            decimal previousResistanceAmount,
            Exercise exercise,
            out string resistanceMakeup)
        {
            resistanceMakeup = null; //Only needed for resistance bands.

            if (exercise.ResistanceType == ResistanceType.BodyWeight || exercise.ResistanceType == ResistanceType.Other)
                return previousResistanceAmount;

            byte multiplier = GetRepCountMultiplier(setType, targetRepsLastTime, actualRepsLastTime);

            throw new NotImplementedException();
        }

        private decimal GetDecreasedResistanceBandResistanceAmount(
            decimal previousResistanceAmount,
            short multiplier,
            bool doubleBandResistanceAmounts,
            out string resistanceMakeup)
        {
            throw new NotImplementedException();
            /*
            decimal minIncrease = GetLowestResistanceBandAmount() * multiplier;
            decimal maxIncrease = minIncrease + 10;
            var recommendedBands =
                _resistanceBandService.CalculateNextAvailableResistanceAmount(
                    previousResistanceAmount, minIncrease, maxIncrease, doubleBandResistanceAmounts);
            if (recommendedBands.Any())
                resistanceMakeup = string.Join(',', recommendedBands.Select(band => band.Color));
            else
                resistanceMakeup = null;

            return recommendedBands.Sum(band => band.MaxResistanceAmount);
            */
        }

        #endregion Private Non-Static Methods

        #region Private Static Methods
        private static bool ActualRepsSignificantlyLessThanTarget(
            SetType setType,
            byte targetReps,
            byte actualReps)
        {
            //TODO: Allow this to be configurable
            //TODO: Modify for different set types
            return (targetReps - actualReps) >= 10;
        }

        private static bool ActualRepsLessThanTarget(
            SetType setType,
            byte targetReps,
            byte actualReps)
        {
            //TODO: Allow this to be configurable
            //TODO: Modify for different set types
            byte difference = ((byte)(targetReps - actualReps));
            return difference < 10 && difference >= 6;
        }

        private static byte GetRepCountMultiplier(SetType setType, byte targetRepsLastTime, byte actualRepsLastTime)
        {
            if (ActualRepsSignificantlyLessThanTarget(setType, targetRepsLastTime, actualRepsLastTime))
            {
                return 3;
            }
            else if (ActualRepsLessThanTarget(setType, targetRepsLastTime, actualRepsLastTime))
            {
                return 2;
            }
            else
            {
                return 1;
            }
        }
        #endregion Private Static Methods
    }
}
