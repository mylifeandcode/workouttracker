using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace WorkoutTracker.Application.Shared.Interfaces
{
    public interface ISimpleService<T>
    {
        Task<T> AddAsync(T value, CancellationToken cancellationToken = default);
        Task<T> UpdateAsync(T value, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> GetAllWithoutTrackingAsync(CancellationToken cancellationToken = default);
        Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<T?> GetByPublicIdAsync(Guid publicId, CancellationToken cancellationToken = default);
    }
}
