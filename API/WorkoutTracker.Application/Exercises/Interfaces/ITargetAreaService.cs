using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Interfaces
{
    public interface ITargetAreaService
    {
        Task<IEnumerable<TargetArea>> GetAllAsync();
        Task<TargetArea?> GetAsync(int id);
        Task<IEnumerable<TargetArea>> GetByIdsAsync(int[] ids);
    }
}
