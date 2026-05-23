using System.Collections.Generic;
using System.Threading.Tasks;

namespace WorkoutTracker.Application.Shared.Interfaces
{
    public interface IServiceBase<T>
    {
        Task<T> AddAsync(T entity, bool saveChanges = false);
        Task DeleteAsync(int entityId);
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(int id);
        Task<int> GetTotalCountAsync();
        Task<T> UpdateAsync(T entity, bool saveChanges = false);
    }
}
