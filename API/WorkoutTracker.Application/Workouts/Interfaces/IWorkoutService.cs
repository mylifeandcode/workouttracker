using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IWorkoutService : IPublicEntityServiceBase<Workout>
    {
        Task<IEnumerable<Workout>> GetAsync(int firstRecord, short pageSize, WorkoutFilter filter);
        Task<int> GetTotalCountAsync(WorkoutFilter filter);
        Task RetireAsync(Guid publicId);
        Task ReactivateAsync(Guid publicId);
    }
}
