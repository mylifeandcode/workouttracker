using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Users;
using WorkoutTracker.Application.Resistances;

namespace WorkoutTracker.Application.Exercises
{
    /// <summary>
    /// A service to provide an adjustment recommendation for an exercise.
    /// This adjustment is not an *increase*, but rather an adjustment, in reps, resistance, or both.
    /// </summary>
    public class AdjustmentRecommendationService : RecommendationService, IAdjustmentRecommendationService
    {
        private IResistanceBandService _resistanceBandService;

        public AdjustmentRecommendationService(IResistanceBandService resistanceBandService)
        {
            _resistanceBandService = (resistanceBandService ?? throw new ArgumentNullException(nameof(resistanceBandService)));
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

            string resistanceMakeup;
            bool recommendingDecreasedResistance = false;

            var recommendation = new ExerciseAmountRecommendation(executedExercise);
            if (inadequateForm || inadequateRangeOfMotion) //Because we have both, we can make this more granular later if need be
            {
                recommendingDecreasedResistance = true;
                recommendation.ResistanceAmount =
                    GetDecreasedResistanceAmount(
                        executedExercise.SetType,
                        executedExercise.TargetRepCount,
                        executedExercise.ActualRepCount,
                        executedExercise.ResistanceAmount,
                        executedExercise.Exercise,
                        out resistanceMakeup);
                recommendation.ResistanceMakeup = resistanceMakeup;
            }

            if (ShouldRepCountBeLowered(actualRepsLessThanTarget, recommendingDecreasedResistance, actualRepsSignificantlyLessThanTarget))
                recommendation.Reps = GetDecreasedRepCount(executedExercise.SetType, userSettings, executedExercise.TargetRepCount, executedExercise.ActualRepCount);

            return recommendation;
        }

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
            decimal resistanceAmount = 0;

            switch (exercise.ResistanceType)
            {
                case ResistanceType.BodyWeight:
                    //TODO: Modify resistance amount to be nullable
                    break;

                case ResistanceType.FreeWeight:
                    break;

                case ResistanceType.MachineWeight:
                    //TODO: Get the appropriate lower weight in 10lb increments below that last time
                    break;

                case ResistanceType.Other:
                    //TODO: Figure out what to do here!
                    break;

                case ResistanceType.ResistanceBand:
                    resistanceAmount = 
                        GetDecreasedResistanceBandResistanceAmount(
                            previousResistanceAmount, multiplier, !exercise.OneSided, out resistanceMakeup);
                    break;
            }

            return resistanceAmount;
       }

        private decimal GetDecreasedResistanceBandResistanceAmount(
            decimal previousResistanceAmount,
            short multiplier,
            bool doubleBandResistanceAmounts,
            out string resistanceMakeup)
        {
            decimal lowestResistanceBandAmount = _resistanceBandService.GetLowestResistanceBand()?.MaxResistanceAmount ?? 0; 
            decimal minIncrease = lowestResistanceBandAmount * multiplier;
            decimal maxIncrease = minIncrease + 10;
            var recommendedBands =
                _resistanceBandService.CalculateNextAvailableResistanceAmount(
                    previousResistanceAmount, minIncrease, maxIncrease, doubleBandResistanceAmounts);
            if (recommendedBands.Any())
                resistanceMakeup = string.Join(',', recommendedBands.Select(band => band.Color));
            else
                resistanceMakeup = null;

            return recommendedBands.Sum(band => band.MaxResistanceAmount);
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

        private static bool ShouldRepCountBeLowered(
            bool lastRepCountLessThanTarget, 
            bool recommendingResistanceBeLowered, 
            bool lastRepCountSignificantlyLessThanTarget)
        {
            if (!lastRepCountLessThanTarget)
                return false;

            //This could be consolidated to a single line, but this way is more readable :)
            if (!recommendingResistanceBeLowered || recommendingResistanceBeLowered && lastRepCountSignificantlyLessThanTarget)
                return true;
            else
                return false;
        }

        private static byte GetDecreasedRepCount(
            SetType setType, 
            UserSettings userSettings, 
            byte targetRepsLastTime, 
            byte actualRepsLastTime)
        {
            throw new NotImplementedException();
        }
        #endregion Private Static Methods
    }
}
