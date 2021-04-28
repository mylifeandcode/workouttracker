using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Resistances;
using WorkoutApplication.Domain.Users;
using WorkoutApplication.Domain.Workouts;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.Resistances;

namespace WorkoutTracker.Application.Exercises
{
    public class ExerciseAmountRecommendationService : IExerciseAmountRecommendationService
    {
        private IResistanceBandService _resistanceBandService;

        private ResistanceBand _lowestResistanceBand;
        private static TimeSpan RECENTLY_PERFORMED_EXERCISE_THRESHOLD = new TimeSpan(14, 0, 0, 0);

        private const decimal LOWEST_FREEWEIGHT_RESISTANCE = 5;
        private const decimal LOWEST_MACHINE_RESISTANCE = 10;


        public ExerciseAmountRecommendationService(
            IResistanceBandService resistanceBandService)
        {
            _resistanceBandService = resistanceBandService ?? throw new ArgumentNullException(nameof(resistanceBandService));
        }

        public ExerciseAmountRecommendation GetRecommendation(
            Exercise exercise, 
            ExecutedWorkout lastWorkoutWithThisExercise, 
            UserSettings userSettings = null)
        {
            //TODO: Add support for drop sets.

            if (exercise == null)
                throw new ArgumentNullException(nameof(exercise));

            var lastSetsOfThisExercise = GetLastSetsOfExercise(exercise.Id, lastWorkoutWithThisExercise);

            if (userSettings == null)
                userSettings = UserSettings.GetDefault(); //TODO: Remove stopgap.

            if (UserHasPerformedExeriseBefore(lastWorkoutWithThisExercise))
            {
                if (UserHasPerformedExerciseRecently(lastSetsOfThisExercise))
                {
                    //Based on progress, adjust weights or reps, up or down, accordingly
                    return GetProgressBasedRecommendation(lastSetsOfThisExercise, userSettings);
                }
                else
                {
                    //Recommend same as last time, or lower weights or rep if they 
                    //did poorly
                    return GetRecommendationForExerciseNotPerformedRecently(lastSetsOfThisExercise);
                }
            }
            else
            {
                return GetDefaultRecommendation(exercise);
            }
        }

        private static List<ExecutedExercise> GetLastSetsOfExercise(int exerciseId, ExecutedWorkout workout)
        {
            if (workout == null)
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

        private ExerciseAmountRecommendation GetDefaultRecommendation(
            Exercise exercise)
        {
            var recommendation = new ExerciseAmountRecommendation();
            recommendation.ExerciseId = exercise.Id;
            
            recommendation.Reps = 10; //TODO: Tailor to user's goals (bulk, weight loss, etc)
                                      //TODO: Tailor to set type (timed set would generally have more reps than a repitition set).
            
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
            //TODO: Refactor into the ReistanceBandService.

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

        private ExerciseAmountRecommendation GetProgressBasedRecommendation(
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
                    return GetAdjustmentRecommendation(firstExerciseSet);
                }
            }
            else
            {
                return GetAdjustmentRecommendation(firstExerciseSet);
            }
        }

        private ExerciseAmountRecommendation GetRecommendationForExerciseNotPerformedRecently(List<ExecutedExercise> executedExercises)
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
                return GetAdjustmentRecommendation(firstExerciseOfSet);
            }
        }

        private static ExecutedExercise GetFirstExericseBySequence(List<ExecutedExercise> executedExercises)
        {
            return executedExercises.OrderBy(exercise => exercise.Sequence).First();
        }

        private static bool HadAdequateRating(ushort rating)
        {
            //TODO: Implement profile-based thresholds
            return rating >= 4;
        }

        private ExerciseAmountRecommendation GetIncreaseRecommendation(
            ExecutedExercise executedExercise, 
            UserSettings userSettings)
        {
            var recommendation = new ExerciseAmountRecommendation();

            //Increase reps or resistance?
            var repSettings = GetRepSettings(userSettings.RepSettings, executedExercise.SetType, executedExercise.Duration);
            if (executedExercise.ActualRepCount >= repSettings.MaxReps)
            {
                //Increase resistance and set reps to the minimum for this type of set.
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
                recommendation.Reason = "Previous max reps surpassed.";
            }
            else
            {
                //Increase reps and leave resistance the same.
                recommendation.Reps = GetIncreasedTargetRepCount(executedExercise, userSettings);
                recommendation.ResistanceAmount = executedExercise.ResistanceAmount;
                recommendation.ResistanceMakeup = executedExercise.ResistanceMakeup;
                recommendation.Reason = "Max reps not yet surpassed.";
            }

            return recommendation;
        }

        private static ExerciseAmountRecommendation GetAdjustmentRecommendation(ExecutedExercise executedExercise)
        {
            throw new NotImplementedException();
            var recommendation = new ExerciseAmountRecommendation();
            return recommendation;
        }

        private static UserMinMaxReps GetRepSettings(List<UserMinMaxReps> repSettings, SetType setType, ushort? duration)
        {
            var settings = 
                repSettings
                    .FirstOrDefault(reps => reps.SetType == setType && reps.Duration == duration);

            //If not found, return an attempt at some defaults. Wild guess really.
            return settings ?? new UserMinMaxReps { Duration = duration, MinReps = 15, MaxReps = 30 };
        }

        private decimal GetIncreasedResistanceAmount(
            ushort targetRepsLastTime, 
            ushort actualRepsLastTime, 
            decimal previousResistanceAmount, 
            Exercise exercise, 
            out string resistanceMakeup)
        {
            //TODO: This has a code smell. Can I find a better way of handling this?

            resistanceMakeup = null; //Only needed for resistance bands.

            //For a resistance type we can't increase, just return the previous resistance amount.
            if (exercise.ResistanceType == ResistanceType.BodyWeight || exercise.ResistanceType == ResistanceType.Other)
                return previousResistanceAmount;

            byte multiplier = GetMultiplierBasedOnReps(targetRepsLastTime, actualRepsLastTime);

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

        private ushort GetIncreasedTargetRepCount(ExecutedExercise executedExercise, UserSettings userSettings)
        {
            throw new NotImplementedException();
        }

        private static bool UserGreatlyExceededTargetRepCount(ushort targetRepCount, ushort actualRepCount)
        {
            return (actualRepCount - targetRepCount) >= 15;
        }

        private static bool UserExceededTargetRepCount(ushort targetRepCount, ushort actualRepCount)
        {
            short difference = (short)(actualRepCount - targetRepCount);
            return difference <= 14 && difference >= 1;
        }

        private static bool UserMetTargetRepCount(ushort targetRepCount, ushort actualRepCount)
        {
            //TODO: Re-evaluate. Probably not necessary -- would be the default
            //condition.
            return targetRepCount == actualRepCount;
        }

        private static decimal GetIncreasedFreeWeightResistanceAmount(decimal previousResistanceAmount, byte multiplier)
        {
            return previousResistanceAmount + (LOWEST_FREEWEIGHT_RESISTANCE * multiplier);
        }

        private static decimal GetIncreasedMachineResistanceAmount(decimal previousResistanceAmount, byte multiplier)
        {
            return previousResistanceAmount + (LOWEST_MACHINE_RESISTANCE * multiplier);
        }

        private static byte GetMultiplierBasedOnReps(ushort targetRepsLastTime, ushort actualRepsLastTime)
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

        /*
        private short GetIncreasedTargetRepCountForTimedSet(
            decimal targetRepsLastTime, 
            decimal actualRepsLastTime, 
            decimal maxRepCount)
        {
            //This is intended for timed sets. Target rep count for repetition sets
            //would remain the same, and we'd increase or decrease the resistance amount.
            if (UserGreatlyExceededTargetRepCount(targetRepsLastTime, actualRepsLastTime))
            {
            }
            else if (UserExceededTargetRepCount(targetRepsLastTime, actualRepsLastTime))
            {
            }
            else 
            { 
            }
        }
        */
    }
}
