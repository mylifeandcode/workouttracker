using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IWorkoutService: IPublicEntityServiceBase<Workout>
    {
        Workout Add(Workout workout, bool saveChanges = false);
        Workout Update(Workout workout, bool saveChanges = false);
        void Delete(int workoutId);
        IEnumerable<Workout> Get(int firstRecord, short pageSize, WorkoutFilter filter);
        int GetTotalCount();
        Workout GetById(int workoutId);
        Workout GetByPublicId(Guid publicId);
        void Retire(Guid publicId);
        void Reactivate(Guid publicId);
        int GetTotalCount(WorkoutFilter filter);
    }
}
