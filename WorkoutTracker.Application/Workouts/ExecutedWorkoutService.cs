using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Workouts;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;

namespace WorkoutTracker.Application.Workouts
{
    public class ExecutedWorkoutService : ServiceBase<ExecutedWorkout>, IExecutedWorkoutService
    {
        private IRepository<Workout> _workoutRepo;

        public ExecutedWorkoutService(IRepository<ExecutedWorkout> executedWorkoutRepo, IRepository<Workout> workoutRepo) : base(executedWorkoutRepo) 
        {
            _workoutRepo = workoutRepo ?? throw new ArgumentNullException(nameof(workoutRepo));
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
            throw new NotImplementedException();
        }

        public ExecutedWorkout Save(ExecutedWorkout executedWorkout)
        {
            throw new NotImplementedException();
        }

        private ExecutedWorkout CreateNewExecutedWorkout(Workout workout)
        {
            var executedWorkout = new ExecutedWorkout();

            foreach (var exercise in workout.Exercises)
            {
                //TODO: Add new constructor to ExecutedExercise which takes an ExerciseInWorkout param 
                //and initialize that way instead.
                var exerciseToExecute = new ExecutedExercise();
                exerciseToExecute.CreatedByUserId = workout.CreatedByUserId;
                exerciseToExecute.CreatedDateTime = DateTime.Now;
                exerciseToExecute.Exercise = exercise.Exercise;
                exerciseToExecute.Sequence = exercise.Sequence;

                //TODO: Add logic to populate target reps and resistances from last time when applicable
                executedWorkout.Exercises.Add(exerciseToExecute);
            }

            return executedWorkout;
        }
    }
}
