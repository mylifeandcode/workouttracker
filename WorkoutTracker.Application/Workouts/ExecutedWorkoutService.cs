using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Workouts;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;
using WorkoutTracker.Application.Exercises;

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

        public ExecutedWorkout Get(int id)
        {
            return _repo.Get(id);
        }

        public ExecutedWorkout Save(ExecutedWorkout executedWorkout)
        {
            throw new NotImplementedException();
        }

        private ExecutedWorkout CreateNewExecutedWorkout(Workout workout)
        {
            var executedWorkout = new ExecutedWorkout();
            executedWorkout.Exercises = new List<ExecutedExercise>(); //TODO: Initialize by known size

            foreach (var exercise in workout.Exercises)
            {
                for(int x = 0; x < exercise.NumberOfSets; x++)
                { 
                    //TODO: Add new constructor to ExecutedExercise which takes an ExerciseInWorkout param 
                    //and initialize that way instead.
                    var exerciseToExecute = new ExecutedExercise();
                    exerciseToExecute.CreatedByUserId = workout.CreatedByUserId;
                    exerciseToExecute.CreatedDateTime = DateTime.Now;
                    exerciseToExecute.Exercise = exercise.Exercise;
                    exerciseToExecute.Sequence = exercise.Sequence;
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
    }
}
