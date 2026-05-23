using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Interfaces
{
    public interface IExerciseService
    {
        Task<Exercise> AddAsync(Exercise exercise, bool saveChanges = false);
        Task<Exercise> UpdateAsync(Exercise exercise, bool saveChanges = false);
        Task DeleteAsync(int exerciseId);
        Task<IEnumerable<Exercise>> GetAsync(int firstRecord, short pageSize, ExerciseFilter filter);
        Task<int> GetTotalCountAsync();
        Task<Exercise?> GetByIdAsync(int exerciseId);
        Task<Exercise?> GetByPublicIdAsync(Guid publicId);
        Dictionary<int, string> GetResistanceTypes();
        Task<int> GetTotalCountAsync(ExerciseFilter filter);
    }
}
