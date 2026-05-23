using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using WorkoutTracker.Data;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.Repository
{
    public interface IRepository<TEntity>
    {
        IQueryable<TEntity> Get();
        IQueryable<TEntity> GetWithoutTracking();

        Task<TEntity?> GetAsync(int id);
        Task<TEntity?> GetWithoutTrackingAsync(int id);
        Task<IEnumerable<TEntity>> GetAllAsync();
        Task<IEnumerable<TEntity>> GetAllWithoutTrackingAsync();

        Task<TEntity> AddAsync(TEntity entity, bool saveChanges = false);
        Task<TEntity> UpdateAsync(TEntity entity, bool saveChanges = false);
        Task DeleteAsync(int id);

        void SetValues(TEntity target, TEntity source);

        Task<int> UpdateAsync<T>(T entity, params Expression<Func<T, object>>[] navigations) where T : Entity;

        Task<bool> AnyAsync();
        Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate);
        Task<int> GetTotalCountAsync();
    }
}
