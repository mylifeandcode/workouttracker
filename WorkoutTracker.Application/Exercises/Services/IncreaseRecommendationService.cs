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
    public class IncreaseRecommendationService : IIncreaseRecommendationService
    {
        private IResistanceBandService _resistanceBandService;

        #region Constants
        private const decimal LOWEST_FREEWEIGHT_RESISTANCE = 5;
        private const decimal LOWEST_MACHINE_RESISTANCE = 10;
        #endregion Constants

        public IncreaseRecommendationService(IResistanceBandService resistanceBandService)
        {
            _resistanceBandService = resistanceBandService ?? throw new ArgumentNullException(nameof(resistanceBandService));
        }

        #region Public Methods
        public ExerciseAmountRecommendation GetIncreaseRecommendation(
            ExecutedExercise executedExercise,
            UserSettings userSettings)
        {
            if (executedExercise == null) throw new ArgumentNullException(nameof(executedExercise));
            if (userSettings == null) throw new ArgumentNullException(nameof(userSettings));

            if (executedExercise.SetType == SetType.Timed)
            {
                return GetTimedSetIncreaseRecommendation(executedExercise, userSettings);
            }
            else //Repititon set
            {
                return GetRepititionSetIncreaseRecommendation(executedExercise);
            }
        }
        #endregion Public Methods

        #region Private Non-Static Methods

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

            //Increase reps or resistance?
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

            //For repitition sets, we'll increase the resistance amount

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

        private decimal GetIncreasedResistanceAmount(
            byte targetRepsLastTime,
            byte actualRepsLastTime,
            decimal previousResistanceAmount,
            Exercise exercise,
            out string resistanceMakeup)
        {
            resistanceMakeup = null; //Only needed for resistance bands.

            if (exercise.ResistanceType == ResistanceType.BodyWeight || exercise.ResistanceType == ResistanceType.Other)
                return previousResistanceAmount;

            byte multiplier = GetRepCountMultiplier(targetRepsLastTime, actualRepsLastTime);

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
            decimal minIncrease = _resistanceBandService.GetLowestResistanceBand().MaxResistanceAmount * multiplier;
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
        private static UserMinMaxReps GetRepSettings(List<UserMinMaxReps> repSettings, SetType setType, ushort? duration)
        {
            var settings =
                repSettings
                    .FirstOrDefault(reps => reps.SetType == setType && reps.Duration == duration);

            //If not found, return an attempt at some defaults. Wild guess really.
            return settings ?? new UserMinMaxReps { Duration = duration, MinReps = 15, MaxReps = 30 };
        }

        private static byte GetRepCountMultiplier(byte targetRepsLastTime, byte actualRepsLastTime)
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

        private static bool UserGreatlyExceededTargetRepCount(byte targetRepCount, byte actualRepCount)
        {
            return actualRepCount - targetRepCount >= 15;
        }

        private static bool UserExceededTargetRepCount(byte targetRepCount, byte actualRepCount)
        {
            decimal difference = actualRepCount - targetRepCount;
            return difference <= 14 && difference >= 1;
        }

        private static decimal GetIncreasedFreeWeightResistanceAmount(decimal previousResistanceAmount, byte multiplier)
        {
            return previousResistanceAmount + LOWEST_FREEWEIGHT_RESISTANCE * multiplier;
        }

        private static decimal GetIncreasedMachineResistanceAmount(decimal previousResistanceAmount, byte multiplier)
        {
            return previousResistanceAmount + LOWEST_MACHINE_RESISTANCE * multiplier;
        }
        #endregion Private Static Methods
    }
}
