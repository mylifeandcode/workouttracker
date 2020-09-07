using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Workouts;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;

namespace WorkoutTracker.Application.Workouts
{
    public class ExecutedWorkoutService : ServiceBase<ExecutedWorkout>, IExecutedWorkoutService
    {
        public ExecutedWorkoutService(IRepository<ExecutedWorkout> repo) : base(repo) { }

        public ExecutedWorkout Create(int workoutId)
        {
            throw new NotImplementedException();
        }

        public ExecutedWorkout Get(int id)
        {
            throw new NotImplementedException();
        }

        public ExecutedWorkout Save(ExecutedWorkout executedWorkout)
        {
            throw new NotImplementedException();
        }
    }
}
