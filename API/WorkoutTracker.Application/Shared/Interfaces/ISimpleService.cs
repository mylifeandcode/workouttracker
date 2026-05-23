using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WorkoutTracker.Application.Shared.Interfaces
{
    public interface ISimpleService<T>
    {
        Task<T> AddAsync(T value);
        Task<T> UpdateAsync(T value);
        Task DeleteAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> GetAllWithoutTrackingAsync();
        Task<T?> GetByIdAsync(int id);
        Task<T?> GetByPublicIdAsync(Guid publicId);
    }
}
