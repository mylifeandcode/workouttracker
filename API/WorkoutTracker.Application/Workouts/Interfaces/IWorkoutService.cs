using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IWorkoutService
    {
        Workout Add(Workout workout, bool saveChanges = false);
        Workout Update(Workout workout, bool saveChanges = false);
        void Delete(int workoutId);
        IEnumerable<Workout> Get(int firstRecord, short pageSize, WorkoutFilter filter);
        int GetTotalCount();
        Workout GetById(int workoutId);
        Workout GetByPublicId(Guid publicId);
        void Retire(int workoutId);
        void Reactivate(int workoutId);
        int GetTotalCount(WorkoutFilter filter);
    }
}
