using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Data;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.Repository
{
    public interface IRepository<TEntity>
    {
        IQueryable<TEntity> Get();
        TEntity Get(int id);
        TEntity Add(TEntity entity, bool saveChanges = false);
        //Task<TEntity> AddAsync(TEntity entity, bool saveChanges = false);
        TEntity Update(TEntity entity, bool saveChanges = false);
        void Delete(int id);

        //TODO: Re-evaluate. I don't think this method is needed.
        //void Save();

        //TODO: Re-evaluate. I don't think this method is needed.
        //Task SaveAsync();

        void SetValues(TEntity target, TEntity source);

        Task<int> UpdateAsync<T>(T entity, params Expression<Func<T, object>>[] navigations) where T : Entity;

        bool Any();
        bool Any(Expression<Func<TEntity, bool>> predicate);
    }
}
