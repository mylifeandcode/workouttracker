using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Workouts;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;
using WorkoutTracker.Application.Exercises;
using WorkoutTracker.Application.FilterClasses;

namespace WorkoutTracker.Application.Workouts
{
    public class ExecutedWorkoutService : ServiceBase<ExecutedWorkout>, IExecutedWorkoutService
    {
        private IRepository<Workout> _workoutRepo;
        private IExerciseAmountRecommendationService _exerciseRecommendationService;

        public ExecutedWorkoutService(
            IRepository<ExecutedWorkout> executedWorkoutRepo, 
            IRepository<Workout> workoutRepo,
            IExerciseAmountRecommendationService exerciseAmountRecommendationService) : base(executedWorkoutRepo) 
        {
            _workoutRepo = workoutRepo ?? throw new ArgumentNullException(nameof(workoutRepo));
            _exerciseRecommendationService = exerciseAmountRecommendationService ?? throw new ArgumentNullException(nameof(exerciseAmountRecommendationService));
        }

        public ExecutedWorkout Create(int workoutId)
        {
            try
            {
                var workout = _workoutRepo.Get(workoutId);
                if (workout == null)
                    throw new ArgumentException($"Workout {workoutId} not found.");
                else
                    return CreateNewExecutedWorkout(workout);
            }
            catch (Exception ex)
            {
                //TODO: Log
                throw;
            }
        }

        public override ExecutedWorkout Add(ExecutedWorkout entity, bool saveChanges = false)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            /*
            When attempting to save an ExecutedWorkout, the following exception would
            occur:

            "The instance of entity type 'TargetArea' cannot be tracked because 
            another instance with the same key value for {'Id'} is already being 
            tracked. When attaching existing entities, ensure that only one entity 
            instance with a given key value is attached. Consider using 
            'DbContextOptionsBuilder.EnableSensitiveDataLogging' to see the 
            conflicting key values."
            
            This is because ExecutedExercise has a reference to an Exercise, which 
            in turn has a collection of ExerciseTargetAreaLinks, which in turn relate 
            to TargetAreas. One solution to the problem would be to set the state 
            of the Exercise objects to EntityState.Unchanged, but this requires a 
            reference to the DbContext. I'm going with the simpler (albeit less 
            elegant) approach here, which is to set the Exercises to null. The 
            reference will still be preserved via the ExerciseId property.
            */
            foreach (var executedExercise in entity.Exercises)
            {
                executedExercise.Exercise = null;
            }

            return base.Add(entity, saveChanges);
        }

        public IEnumerable<ExecutedWorkout> GetFilteredSubset(int firstRecordIndex, short subsetSize, ExecutedWorkoutFilter filter)
        {
            IQueryable<ExecutedWorkout> query = _repo.Get();

            if (filter != null)
                ApplyQueryFilters(ref query, filter);

            var output = query.Skip(firstRecordIndex).Take(subsetSize);
            return output;
        }

        #region Private Methods
        private ExecutedWorkout CreateNewExecutedWorkout(Workout workout)
        {
            var executedWorkout = new ExecutedWorkout();
            executedWorkout.WorkoutId = workout.Id;
            executedWorkout.Exercises = new List<ExecutedExercise>(); //TODO: Initialize by known size

            foreach (var exercise in workout.Exercises?.OrderBy(x => x.Sequence))
            {
                for(int x = 0; x < exercise.NumberOfSets; x++)
                { 
                    //TODO: Add new constructor to ExecutedExercise which takes an ExerciseInWorkout param 
                    //and initialize that way instead.
                    var exerciseToExecute = new ExecutedExercise();
                    exerciseToExecute.CreatedByUserId = workout.CreatedByUserId;
                    exerciseToExecute.CreatedDateTime = DateTime.Now.ToUniversalTime();
                    exerciseToExecute.Exercise = exercise.Exercise;
                    exerciseToExecute.ExerciseId = exercise.Exercise.Id;
                    exerciseToExecute.Sequence = x;
                    exerciseToExecute.SetType = exercise.SetType;

                    var recommendation = _exerciseRecommendationService.GetRecommendation(exercise.ExerciseId);
                    exerciseToExecute.TargetRepCount = recommendation.Reps;
                    exerciseToExecute.ResistanceAmount = recommendation.ResistanceAmount;
                    exerciseToExecute.ResistanceMakeup = recommendation.ResistanceMakeup;

                    executedWorkout.Exercises.Add(exerciseToExecute);
                }
            }

            return executedWorkout;
        }

        private void ApplyQueryFilters(ref IQueryable<ExecutedWorkout> query, ExecutedWorkoutFilter filter)
        {
            if (filter == null)
                return;

            query = query.Where(x => x.CreatedByUserId == filter.UserId);
            
            if (filter.StartDateTime.HasValue)
                query = query.Where(x => x.StartDateTime >= filter.StartDateTime);

            if (filter.EndDateTime.HasValue)
                query = query.Where(x => x.EndDateTime <= filter.EndDateTime);
        }

        #endregion Private Methods
    }
}
