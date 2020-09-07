using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts
{
    public interface IExecutedWorkoutService
    {
        ExecutedWorkout Create(int workoutId);
        ExecutedWorkout Get(int id);
        ExecutedWorkout Save(ExecutedWorkout executedWorkout);
    }
}
