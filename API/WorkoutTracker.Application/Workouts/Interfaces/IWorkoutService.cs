using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IWorkoutService : IPublicEntityServiceBase<Workout>
    {
        Task<IEnumerable<Workout>> GetAsync(int firstRecord, short pageSize, WorkoutFilter filter, bool sortAscending = true, CancellationToken cancellationToken = default);
        Task<int> GetTotalCountAsync(WorkoutFilter filter, CancellationToken cancellationToken = default);
        Task RetireAsync(Guid publicId, CancellationToken cancellationToken = default);
        Task ReactivateAsync(Guid publicId, CancellationToken cancellationToken = default);
    }
}
