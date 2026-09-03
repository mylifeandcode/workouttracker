using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace WorkoutTracker.Application.Shared.Interfaces
{
    public interface IServiceBase<T>
    {
        Task<T> AddAsync(T entity, bool saveChanges = false, CancellationToken cancellationToken = default);
        Task DeleteAsync(int entityId, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default);
        Task<T> UpdateAsync(T entity, bool saveChanges = false, CancellationToken cancellationToken = default);
    }
}
