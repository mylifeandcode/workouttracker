using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Workouts;
using WorkoutTracker.Application.FilterClasses;

namespace WorkoutTracker.Application.Workouts
{
    public interface IWorkoutService
    {
        Workout Add(Workout workout, bool saveChanges = false);
        Workout Update(Workout workout, bool saveChanges = false);
        void Delete(int workoutId);
        IEnumerable<Workout> Get(int firstRecord, short pageSize, WorkoutFilter filter);
        int GetTotalCount();
        Workout GetById(int workoutId);
    }
}
