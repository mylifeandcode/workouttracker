using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Data;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.Repository
{
    public interface IRepository<TEntity>
    {
        IQueryable<TEntity> Get();
        IQueryable<TEntity> GetWithoutTracking();

        Task<TEntity?> GetAsync(int id, CancellationToken cancellationToken = default);
        Task<TEntity?> GetWithoutTrackingAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<TEntity>> GetAllWithoutTrackingAsync(CancellationToken cancellationToken = default);

        Task<TEntity> AddAsync(TEntity entity, bool saveChanges = false, CancellationToken cancellationToken = default);
        Task<TEntity> UpdateAsync(TEntity entity, bool saveChanges = false, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);

        void SetValues(TEntity target, TEntity source);

        Task<int> UpdateAsync<T>(T entity, params Expression<Func<T, object>>[] navigations) where T : Entity;
        Task<int> UpdateAsync<T>(T entity, CancellationToken cancellationToken, params Expression<Func<T, object>>[] navigations) where T : Entity;

        Task<bool> AnyAsync(CancellationToken cancellationToken = default);
        Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
        Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default);
    }
}
