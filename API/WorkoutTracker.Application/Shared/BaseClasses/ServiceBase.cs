using System;
using System.Collections.Generic;
using System.Linq;
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

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }

        public virtual async Task<T?> GetByIdAsync(int id)
        {
            return await _repo.GetAsync(id);
        }

        public virtual async Task<T> AddAsync(T entity, bool saveChanges = false)
        {
            return await _repo.AddAsync(entity, saveChanges);
        }

        public virtual async Task<T> UpdateAsync(T entity, bool saveChanges = false)
        {
            return await _repo.UpdateAsync(entity, saveChanges);
        }

        public virtual async Task DeleteAsync(int entityId)
        {
            await _repo.DeleteAsync(entityId);
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _repo.GetTotalCountAsync();
        }
    }
}
