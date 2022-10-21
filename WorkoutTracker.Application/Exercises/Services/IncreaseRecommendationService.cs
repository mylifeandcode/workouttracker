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
        private IResistanceService _resistanceService;

        #region Constants
        private const decimal LOWEST_FREEWEIGHT_RESISTANCE = 5;
        private const decimal LOWEST_MACHINE_RESISTANCE = 10;
        #endregion Constants

        public IncreaseRecommendationService(IResistanceBandService resistanceBandService, IResistanceService resistanceService)
        {
            _resistanceBandService = resistanceBandService ?? throw new ArgumentNullException(nameof(resistanceBandService));
            _resistanceService = resistanceService ?? throw new ArgumentNullException(nameof(resistanceService));
        }

        #region Public Methods
        public ExerciseAmountRecommendation GetIncreaseRecommendation(
            ExecutedExerciseAverages executedExerciseAverages,
            UserSettings userSettings)
        {
            if (executedExerciseAverages == null) throw new ArgumentNullException(nameof(executedExerciseAverages));
            if (userSettings == null) throw new ArgumentNullException(nameof(userSettings));

            if (executedExerciseAverages.SetType == SetType.Timed)
            {
                return GetTimedSetIncreaseRecommendation(executedExerciseAverages, userSettings);
            }
            else //Repititon set
            {
                return GetRepititionSetIncreaseRecommendation(executedExerciseAverages);
            }
        }
        #endregion Public Methods

        #region Private Non-Static Methods

        private ExerciseAmountRecommendation GetTimedSetIncreaseRecommendation(
            ExecutedExerciseAverages executedExerciseAverages,
            UserSettings userSettings)
        {
            var recommendation = new ExerciseAmountRecommendation();
            var repSettings =
                GetRepSettings(
                    userSettings.RepSettings,
                    executedExerciseAverages.SetType,
                    executedExerciseAverages.AverageDuration);

            //Increase reps or resistance?
            if (executedExerciseAverages.AverageActualRepCount >= repSettings.MaxReps)
            {
                //User met or exceeded max reps. Let's bump up the resistance and set reps to min.
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
            }
            else
            {
                //Increase reps, but keep resistance amounts the same.
                recommendation.Reps =
                    GetIncreasedTargetRepCount(
                        executedExerciseAverages.AverageTargetRepCount,
                        executedExerciseAverages.AverageActualRepCount,
                        repSettings.MaxReps);

                recommendation.ResistanceAmount = executedExerciseAverages.LastExecutedSet.ResistanceAmount;
                recommendation.ResistanceMakeup = executedExerciseAverages.LastExecutedSet.ResistanceMakeup; //TODO: Add constructor to recommendation to default this stuff from an ExecutedExercise
            }

            return recommendation;
        }

        private ExerciseAmountRecommendation GetRepititionSetIncreaseRecommendation(
            ExecutedExerciseAverages executedExerciseAverages)
        {
            var recommendation = new ExerciseAmountRecommendation();

            //For repitition sets, we'll increase the resistance amount

            string resistanceMakeup;
            recommendation.Reps = (byte)executedExerciseAverages.AverageTargetRepCount;
            recommendation.ResistanceAmount =
                GetIncreasedResistanceAmount(
                    executedExerciseAverages.AverageTargetRepCount,
                    executedExerciseAverages.AverageActualRepCount,
                    executedExerciseAverages.AverageResistanceAmount,
                    executedExerciseAverages.Exercise,
                    out resistanceMakeup);
            recommendation.ResistanceMakeup = resistanceMakeup;

            return recommendation;
        }

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

            sbyte multiplier = GetRepCountMultiplier(targetRepsLastTime, actualRepsLastTime);

            return _resistanceService.GetNewResistanceAmount(
                exercise.ResistanceType, 
                previousResistanceAmount, 
                multiplier, 
                !exercise.OneSided, 
                out resistanceMakeup);
        }

        #endregion Private Non-Static Methods

        #region Private Static Methods
        private static UserMinMaxReps GetRepSettings(List<UserMinMaxReps> repSettings, SetType setType, double? averageDuration)
        {
            var settings =
                repSettings
                    .FirstOrDefault(reps => reps.SetType == setType && reps.Duration == averageDuration);

            //If not found, return an attempt at some defaults. Wild guess really.
            return settings ?? new UserMinMaxReps { Duration = 240, MinReps = 15, MaxReps = 30 };
        }

        private static sbyte GetRepCountMultiplier(double targetRepsLastTime, double actualRepsLastTime)
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
            byte maxRepCount)
        {
            double increasedRepCount = actualRepsLastTime;

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

            return (byte)Math.Min(increasedRepCount, maxRepCount); //TODO: Refactor higher up the chain so that if we're only bumping up by a small amount, increase resistance instead and use smaller rep count
        }

        private static bool UserGreatlyExceededTargetRepCount(double targetRepCount, double actualRepCount)
        {
            return actualRepCount - targetRepCount >= 15;
        }

        private static bool UserExceededTargetRepCount(double targetRepCount, double actualRepCount)
        {
            double difference = actualRepCount - targetRepCount;
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
