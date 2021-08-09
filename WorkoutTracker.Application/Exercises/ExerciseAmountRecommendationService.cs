using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Resistances;
using WorkoutApplication.Domain.Users;
using WorkoutApplication.Domain.Workouts;
using WorkoutTracker.Application.Resistances;

namespace WorkoutTracker.Application.Exercises
{
    /// <summary>
    /// A service for producing ExerciseAmountRecommendations
    /// </summary>
    public class ExerciseAmountRecommendationService : IExerciseAmountRecommendationService
    {
        //TODO: Create 2 new classes to inject into this one: 1 for Timed Sets, the other for Repitition Sets

        private IResistanceBandService _resistanceBandService;

        private ResistanceBand _lowestResistanceBand;
        private static TimeSpan RECENTLY_PERFORMED_EXERCISE_THRESHOLD = new TimeSpan(14, 0, 0, 0);

        #region Constants
        private const decimal LOWEST_FREEWEIGHT_RESISTANCE = 5;
        private const decimal LOWEST_MACHINE_RESISTANCE = 10;

        private const byte LOWEST_ACCEPTABLE_RATING = 4;

        private const string REASON_FORM_NEEDS_IMPROVEMENT = "Form needs improvement.";
        private const string REASON_RANGE_OF_MOTION_NEEDS_IMPROVEMENT = "Range of Motion needs improvement.";
        private const string REASON_ACTUAL_REPS_SIGNIFICANTLY_LOWER_THAN_TARGET = "Actual reps last time were significantly lower than target.";
        private const string REASON_ACTUAL_REPS_LOWER_THAN_TARGET = "Actual reps last time lower than target.";
        private const string REASON_GOALS_NOT_MET_BUT_CLOSE = "Goals not met, but close enough to remain the same.";

        private const byte RATING_BAD = 1;
        private const byte RATING_POOR = 2;
        private const byte RATING_OK = 3;
        #endregion Constants

        public ExerciseAmountRecommendationService(
            IResistanceBandService resistanceBandService)
        {
            _resistanceBandService = resistanceBandService ?? throw new ArgumentNullException(nameof(resistanceBandService));
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
            UserSettings userSettings = null)
        {
            if (exercise == null)
                throw new ArgumentNullException(nameof(exercise));

            var lastSetsOfThisExercise = GetLastSetsOfExercise(exercise.Id, lastWorkoutWithThisExercise);

            if (userSettings == null)
                userSettings = UserSettings.GetDefault(); //TODO: Remove stopgap.

            if (UserHasPerformedExeriseBefore(lastWorkoutWithThisExercise))
            {
                if (UserHasPerformedExerciseRecently(lastSetsOfThisExercise))
                {
                    //Adjust weights or reps accordingly
                    return GetPerformanceBasedRecommendation(lastSetsOfThisExercise, userSettings);
                }
                else
                {
                    //Recommend same as last time, or lower weights or rep if they 
                    //did poorly
                    return GetRecommendationForExerciseNotPerformedRecently(lastSetsOfThisExercise, userSettings);
                }
            }
            else
            {
                //Exercise never performed. Start with the default recommendation values.
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
                    recommendation.ResistanceAmount = GetLowestResistanceBandAmount();
                    break;

                case ResistanceType.Other:
                    recommendation.ResistanceAmount = 5;
                    break;

                default:
                    throw new ApplicationException($"Unhandled ResistanceType: {exercise.ResistanceType.ToString()}.");
            }

            return recommendation;
        }

        private decimal GetLowestResistanceBandAmount()
        {
            if (_lowestResistanceBand == null)
                _lowestResistanceBand =
                    _resistanceBandService
                        .GetIndividualBands()
                            .OrderBy(band => band.MaxResistanceAmount)
                            .FirstOrDefault();

            if (_lowestResistanceBand == null)
            {
                _lowestResistanceBand = new ResistanceBand();
                _lowestResistanceBand.MaxResistanceAmount = 3; //Safeguard against no resistance bands having been defined yet
                _lowestResistanceBand.Color = "Undefined";
            }

            return _lowestResistanceBand.MaxResistanceAmount;
        }

        private ExerciseAmountRecommendation GetPerformanceBasedRecommendation(
            List<ExecutedExercise> executedExercises,
            UserSettings userSettings)
        {
            //TODO: Allow for profile-based thresholds
            var firstExerciseSet = GetFirstExericseBySequence(executedExercises);
            if (firstExerciseSet.ActualRepCount >= firstExerciseSet.TargetRepCount)
            {
                if (HadAdequateRating(firstExerciseSet.FormRating)
                    && HadAdequateRating(firstExerciseSet.RangeOfMotionRating))
                {
                    return GetIncreaseRecommendation(firstExerciseSet, userSettings);
                }
                else
                {
                    return GetAdjustmentRecommendation(firstExerciseSet, userSettings);
                }
            }
            else
            {
                return GetAdjustmentRecommendation(firstExerciseSet, userSettings);
            }
        }

        private ExerciseAmountRecommendation GetRecommendationForExerciseNotPerformedRecently(
            List<ExecutedExercise> executedExercises, 
            UserSettings userSettings)
        {
            var firstExerciseOfSet = GetFirstExericseBySequence(executedExercises);

            //How did they do last time?
            if (HadAdequateRating(firstExerciseOfSet.FormRating)
                && HadAdequateRating(firstExerciseOfSet.RangeOfMotionRating)
                && firstExerciseOfSet.ActualRepCount >= firstExerciseOfSet.TargetRepCount)
            {
                //They did well enough last time, but since they haven't done this one
                //recently, have them do what they did last time.
                var recommendation = new ExerciseAmountRecommendation();

                recommendation.ExerciseId = firstExerciseOfSet.ExerciseId;
                recommendation.Reps = firstExerciseOfSet.TargetRepCount;
                recommendation.ResistanceAmount = firstExerciseOfSet.ResistanceAmount;
                recommendation.ResistanceMakeup = firstExerciseOfSet.ResistanceMakeup;

                return recommendation;
            }
            else
            {
                return GetAdjustmentRecommendation(firstExerciseOfSet, userSettings);
            }
        }

        private ExerciseAmountRecommendation GetIncreaseRecommendation(
            ExecutedExercise executedExercise,
            UserSettings userSettings)
        {
            //Increase reps or resistance?
            if (executedExercise.SetType == SetType.Timed)
            {
                return GetTimedSetIncreaseRecommendation(executedExercise, userSettings);
            }
            else //Repititon set
            {
                return GetRepititionSetIncreaseRecommendation(executedExercise);
            }
        }

        private ExerciseAmountRecommendation GetTimedSetIncreaseRecommendation(
            ExecutedExercise executedExercise, 
            UserSettings userSettings)
        {
            var recommendation = new ExerciseAmountRecommendation();
            var repSettings =
                GetRepSettings(
                    userSettings.RepSettings,
                    executedExercise.SetType,
                    executedExercise.Duration);

            if (executedExercise.ActualRepCount >= repSettings.MaxReps)
            {
                //User met or exceeded max reps. Let's bump up the resistance and set reps to min.
                string resistanceMakeup;
                recommendation.Reps = repSettings.MinReps;
                recommendation.ResistanceAmount =
                    GetIncreasedResistanceAmount(
                        executedExercise.TargetRepCount,
                        executedExercise.ActualRepCount,
                        executedExercise.ResistanceAmount,
                        executedExercise.Exercise,
                        out resistanceMakeup);
                recommendation.ResistanceMakeup = resistanceMakeup;
            }
            else
            {
                //Increase reps, but keep resistance amounts the same.
                recommendation.Reps =
                    GetIncreasedTargetRepCount(
                        executedExercise.TargetRepCount,
                        executedExercise.ActualRepCount,
                        repSettings.MaxReps);

                recommendation.ResistanceAmount = executedExercise.ResistanceAmount;
                recommendation.ResistanceMakeup = executedExercise.ResistanceMakeup; //TODO: Add constructor to recommendation to default this stuff from an ExecutedExercise
            }

            return recommendation;
        }

        private ExerciseAmountRecommendation GetRepititionSetIncreaseRecommendation(
            ExecutedExercise executedExercise)
        {
            var recommendation = new ExerciseAmountRecommendation();

            string resistanceMakeup;
            recommendation.Reps = executedExercise.TargetRepCount;
            recommendation.ResistanceAmount =
                GetIncreasedResistanceAmount(
                    executedExercise.TargetRepCount,
                    executedExercise.ActualRepCount,
                    executedExercise.ResistanceAmount,
                    executedExercise.Exercise,
                    out resistanceMakeup);
            recommendation.ResistanceMakeup = resistanceMakeup;

            return recommendation;
        }

        private ExerciseAmountRecommendation GetAdjustmentRecommendation(
            ExecutedExercise executedExercise, 
            UserSettings userSettings)
        {
            //Adjust target reps, resistance, or both.
            throw new NotImplementedException(); //TODO: Implement
            ExerciseAmountRecommendation recommendation;

            bool inadequateForm = !HadAdequateRating(executedExercise.FormRating);
            bool inadequateRangeOfMotion = !HadAdequateRating(executedExercise.RangeOfMotionRating);

            //If form or range of motion was lacking, reduce resistance.
            if (inadequateForm || inadequateRangeOfMotion)
            {
                recommendation.Reason = GetBadRatingReason(inadequateForm, inadequateRangeOfMotion);
                byte multiplier = GetResistanceDecreaseMultiplier(executedExercise.FormRating, executedExercise.RangeOfMotionRating);
                recommendation.ResistanceAmount = GetDecreasedResistanceAmount();
            }
            //If number of reps was significantly less than the target, reduce resistance.
            else if (ActualRepsSignificantlyLessThanTarget(executedExercise.SetType, executedExercise.TargetRepCount, executedExercise.ActualRepCount))
            {
                recommendation = 
                    GetDecreaseRecommendation(executedExercise, userSettings, false, false, true, false);
            }
            else if (ActualRepsLessThanTarget(executedExercise.SetType, executedExercise.TargetRepCount, executedExercise.ActualRepCount))
            {
                recommendation = 
                    GetDecreaseRecommendation(executedExercise, userSettings, false, false, false, true);
            }
            //Otherwise, they didn't meet their goals last time, but they should remain the same.
            else
            {
                recommendation = new ExerciseAmountRecommendation(executedExercise);
                recommendation.Reason = "";
            }

            return recommendation;
        }

        private ExerciseAmountRecommendation GetDecreaseRecommendation(
            ExecutedExercise executedExercise, 
            UserSettings userSettings, 
            bool inadequateForm, 
            bool inadequateRangeOfMotion, 
            bool actualRepsSignificantlyLessThanTarget, 
            bool actualRepsLessThanTarget)
        {
            throw new NotImplementedException();
        }

        private ExerciseAmountRecommendation GetTimedSetDecreaseRecommendation()
        {
            throw new NotImplementedException();
        }

        private ExerciseAmountRecommendation GetRepititionSetDecreaseRecommendation()
        {
            throw new NotImplementedException();
        }

        private decimal GetIncreasedResistanceAmount(
            byte targetRepsLastTime,
            byte actualRepsLastTime,
            decimal previousResistanceAmount,
            Exercise exercise,
            out string resistanceMakeup)
        {
            //TODO: This has a code smell. Can I find a better way of handling this?
            //Only needed for resistance bands.
            resistanceMakeup = null;

            if (exercise.ResistanceType == ResistanceType.BodyWeight || exercise.ResistanceType == ResistanceType.Other)
                return previousResistanceAmount;

            byte multiplier;

            if (UserGreatlyExceededTargetRepCount(targetRepsLastTime, actualRepsLastTime))
            {
                multiplier = 3;
            }
            else if (UserExceededTargetRepCount(targetRepsLastTime, actualRepsLastTime))
            {
                multiplier = 2;
            }
            else
            {
                multiplier = 1;
            }

            switch (exercise.ResistanceType)
            {
                case ResistanceType.FreeWeight:
                    return GetIncreasedFreeWeightResistanceAmount(previousResistanceAmount, multiplier);
                case ResistanceType.MachineWeight:
                    return GetIncreasedMachineResistanceAmount(previousResistanceAmount, multiplier);
                case ResistanceType.ResistanceBand:
                    return GetIncreasedResistanceBandResistanceAmount(
                        previousResistanceAmount,
                        multiplier,
                        !exercise.BandsEndToEnd.Value, //Resistance Band exercises always have a value for this 
                        out resistanceMakeup);
                default:
                    throw new ApplicationException($"Unhandled ResistanceType in switch statement in ExerciseAmountRecommendationService: {exercise.ResistanceType}.");
            }
        }

        private decimal GetIncreasedResistanceBandResistanceAmount(
            decimal previousResistanceAmount,
            short multiplier,
            bool doubleBandResistanceAmounts,
            out string resistanceMakeup)
        {
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
        }

        private decimal GetDecreasedResistanceAmount()
        {
            throw new NotImplementedException();
        }
        #endregion Private Non-Static Methods

        #region Private Static Methods

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

        private static bool UserHasPerformedExeriseBefore(ExecutedWorkout workout)
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

        private static ExecutedExercise GetFirstExericseBySequence(List<ExecutedExercise> executedExercises)
        {
            return executedExercises.OrderBy(exercise => exercise.Sequence).First();
        }

        private static UserMinMaxReps GetRepSettings(List<UserMinMaxReps> repSettings, SetType setType, ushort? duration)
        {
            var settings =
                repSettings
                    .FirstOrDefault(reps => reps.SetType == setType && reps.Duration == duration);

            //If not found, return an attempt at some defaults. Wild guess really.
            return settings ?? new UserMinMaxReps { Duration = duration, MinReps = 15, MaxReps = 30 };
        }

        private static bool HadAdequateRating(byte rating)
        {
            //TODO: Implement profile-based thresholds
            return rating >= LOWEST_ACCEPTABLE_RATING;
        }

        private static bool UserGreatlyExceededTargetRepCount(byte targetRepCount, byte actualRepCount)
        {
            return (actualRepCount - targetRepCount) >= 15;
        }

        private static bool UserExceededTargetRepCount(byte targetRepCount, byte actualRepCount)
        {
            decimal difference = actualRepCount - targetRepCount;
            return difference <= 14 && difference >= 1;
        }

        private static bool UserMetTargetRepCount(byte targetRepCount, byte actualRepCount)
        {
            //TODO: Re-evaluate. Probably not necessary -- would be the default
            //condition.
            return targetRepCount == actualRepCount;
        }

        private string GetBadRatingReason(bool inadequateForm, bool inadequateRangeOfMotion)
        {
            if (inadequateForm && inadequateRangeOfMotion)
                return REASON_FORM_NEEDS_IMPROVEMENT + " " + REASON_RANGE_OF_MOTION_NEEDS_IMPROVEMENT;
            else if (inadequateForm)
                return REASON_FORM_NEEDS_IMPROVEMENT;
            else
                return REASON_RANGE_OF_MOTION_NEEDS_IMPROVEMENT;
        }

        private static byte GetResistanceDecreaseMultiplier(byte formRating, byte rangeOfMotionRating)
        {
            if (UserHadFormOrRangeOfMotionRating(RATING_BAD, formRating, rangeOfMotionRating))
                return 3;
            else if (UserHadFormOrRangeOfMotionRating(RATING_POOR, formRating, rangeOfMotionRating))
                return 2;
            else
                return 1;
        }

        private static bool UserHadFormOrRangeOfMotionRating(byte ratingLevel, byte formRating, byte rangeOfMotionRating)
        {
            return formRating == ratingLevel || rangeOfMotionRating == ratingLevel;
        }

        private static decimal GetIncreasedFreeWeightResistanceAmount(decimal previousResistanceAmount, byte multiplier)
        {
            return previousResistanceAmount + (LOWEST_FREEWEIGHT_RESISTANCE * multiplier);
        }

        private static decimal GetIncreasedMachineResistanceAmount(decimal previousResistanceAmount, byte multiplier)
        {
            return previousResistanceAmount + (LOWEST_MACHINE_RESISTANCE * multiplier);
        }

        private static byte GetIncreasedTargetRepCount(
            byte targetRepsLastTime,
            byte actualRepsLastTime,
            byte maxRepCount)
        {
            byte increasedRepCount = actualRepsLastTime;

            //This is intended for timed sets. Target rep count for repetition sets
            //would remain the same, and we'd increase or decrease the resistance amount.
            if (UserGreatlyExceededTargetRepCount(targetRepsLastTime, actualRepsLastTime))
            {
                increasedRepCount += 15;
            }
            else if (UserExceededTargetRepCount(targetRepsLastTime, actualRepsLastTime))
            {
                increasedRepCount += 10;
            }
            else
            {
                //User met rep count
                increasedRepCount += 5;
            }

            return Math.Min(increasedRepCount, maxRepCount); //TODO: Refactor higher up the chain so that if we're only bumping up by a small amount, increase resistance instead and use smaller rep count
        }

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

        #endregion Private Static Methods

    }
}
