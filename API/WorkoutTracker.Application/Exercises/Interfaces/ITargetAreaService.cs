using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Interfaces
{
    public interface ITargetAreaService
    {
        Task<IEnumerable<TargetArea>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<TargetArea?> GetAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<TargetArea>> GetByIdsAsync(int[] ids, CancellationToken cancellationToken = default);
    }
}
