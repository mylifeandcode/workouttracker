using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Repository;
using WorkoutTracker.Application.Shared.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Application.Shared.BaseClasses
{
    public abstract class ServiceBase<T> : IServiceBase<T>
    {
        protected IRepository<T> _repo;
        protected ILogger _logger;

        public ServiceBase(IRepository<T> repo, ILogger logger)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _repo.GetAllAsync(cancellationToken);
        }

        public virtual async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _repo.GetAsync(id, cancellationToken);
        }

        public virtual async Task<T> AddAsync(T entity, bool saveChanges = false, CancellationToken cancellationToken = default)
        {
            return await _repo.AddAsync(entity, saveChanges, cancellationToken);
        }

        public virtual async Task<T> UpdateAsync(T entity, bool saveChanges = false, CancellationToken cancellationToken = default)
        {
            return await _repo.UpdateAsync(entity, saveChanges, cancellationToken);
        }

        public virtual async Task DeleteAsync(int entityId, CancellationToken cancellationToken = default)
        {
            await _repo.DeleteAsync(entityId, cancellationToken);
        }

        public async Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default)
        {
            return await _repo.GetTotalCountAsync(cancellationToken);
        }
    }
}
