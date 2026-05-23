using System;
using System.Threading.Tasks;

namespace WorkoutTracker.Application.Shared.Interfaces
{
    public interface IPublicEntityServiceBase<T> : IServiceBase<T>
    {
        Task<T?> GetByPublicIDAsync(Guid publicId);
    }
}
