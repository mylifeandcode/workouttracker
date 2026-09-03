using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Interfaces
{
    public interface IExerciseService
    {
        Task<Exercise> AddAsync(Exercise exercise, bool saveChanges = false, CancellationToken cancellationToken = default);
        Task<Exercise> UpdateAsync(Exercise exercise, bool saveChanges = false, CancellationToken cancellationToken = default);
        Task DeleteAsync(int exerciseId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Exercise>> GetAsync(int firstRecord, short pageSize, ExerciseFilter filter, bool sortAscending = true, CancellationToken cancellationToken = default);
        Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default);
        Task<Exercise?> GetByIdAsync(int exerciseId, CancellationToken cancellationToken = default);
        Task<Exercise?> GetByPublicIdAsync(Guid publicId, CancellationToken cancellationToken = default);
        Dictionary<int, string> GetResistanceTypes();
        Task<int> GetTotalCountAsync(ExerciseFilter filter, CancellationToken cancellationToken = default);
    }
}
