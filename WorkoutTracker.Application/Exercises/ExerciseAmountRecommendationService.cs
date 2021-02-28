using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Resistances;
using WorkoutApplication.Domain.Workouts;
using WorkoutApplication.Repository;

namespace WorkoutTracker.Application.Exercises
{
    public class ExerciseAmountRecommendationService : IExerciseAmountRecommendationService
    {
        private IRepository<ExecutedWorkout> _executedWorkoutRepo;
        private IRepository<Exercise> _exerciseRepo;
        private IRepository<ResistanceBand> _resistanceBandRepo;

        private ResistanceBand _lowestResistanceBand;
        private static TimeSpan RECENTLY_PERFORMED_EXERCISE_THRESHOLD = new TimeSpan(14, 0, 0, 0);

        public ExerciseAmountRecommendationService(
            IRepository<ExecutedWorkout> executedWorkoutRepo, 
            IRepository<Exercise> exerciseRepo,
            IRepository<ResistanceBand> resistanceBandRepo
        {
            //Was tempted to pass the repo in to the call to GetRecommendation() instead, 
            //but though having the instance here would be less expensive than passing 
            //the repo in with every call
            _executedWorkoutRepo = executedWorkoutRepo ?? throw new ArgumentNullException(nameof(executedWorkoutRepo));

            _exerciseRepo = exerciseRepo ?? throw new ArgumentNullException(nameof(exerciseRepo));
            _resistanceBandRepo = resistanceBandRepo ?? throw new ArgumentNullException(nameof(resistanceBandRepo));
        }

        public ExerciseAmountRecommendation GetRecommendation(int exerciseId)
        {
            var lastWorkoutWithThisExercise = GetLastWorkoutWithExercise(exerciseId);
            var lastSetsOfThisExercise = GetLastSetsOfExercise(exerciseId, lastWorkoutWithThisExercise);

            if (UserHasPerformedExeriseBefore(lastWorkoutWithThisExercise))
            {
                if (UserHasPerformedExerciseRecently(lastSetsOfThisExercise))
                {
                    //Increase weights or reps accordingly
                    return GetProgressBasedRecommendation(lastSetsOfThisExercise);
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
                return GetDefaultRecommendation(exerciseId);
            }
        }

        private ExecutedWorkout GetLastWorkoutWithExercise(int exerciseId)
        {
            return _executedWorkoutRepo
                    .Get()
                    .OrderByDescending(workout => workout.EndDateTime)
                    .FirstOrDefault(Workout => Workout.Exercises.Any(exercise => exercise.ExerciseId == exerciseId);
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

        private ExerciseAmountRecommendation GetDefaultRecommendation(int exerciseId)
        {
            var exercise = _exerciseRepo.Get(exerciseId);
            if (exercise == null)
                throw new ApplicationException($"Exercise {exerciseId} not found.");

            var recommendation = new ExerciseAmountRecommendation();
            recommendation.ExerciseId = exerciseId;
            recommendation.Reps = 10; //TODO: Taylor to user's goals (bulk, weight loss, etc)

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
                    _resistanceBandRepo
                        .Get()
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

        private ExerciseAmountRecommendation GetProgressBasedRecommendation(List<ExecutedExercise> executedExercises)
        {
            //TODO: Allow for profile-based thresholds
            var firstExerciseSet = GetFirstExericseBySequence(executedExercises);
            if (firstExerciseSet.ActualRepCount >= firstExerciseSet.TargetRepCount)
            {
                if (HadAdequateRating(firstExerciseSet.FormRating)
                    && HadAdequateRating(firstExerciseSet.RangeOfMotionRating))
                {
                    return GetIncreaseRecommendation(firstExerciseSet);
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

        private ExerciseAmountRecommendation GetIncreaseRecommendation(ExecutedExercise executedExercise)
        {
            var recommendation = new ExerciseAmountRecommendation();
            return recommendation;
        }

        private ExerciseAmountRecommendation GetAdjustmentRecommendation(ExecutedExercise executedExercise)
        {
            var recommendation = new ExerciseAmountRecommendation();
            return recommendation;
        }
    }
}
