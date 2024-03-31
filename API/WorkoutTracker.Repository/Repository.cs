using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using WorkoutTracker.Data;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.Repository
{
    public class Repository<TEntity> : IRepository<TEntity> where TEntity : Entity
    {
        protected WorkoutsContext _context;
        protected DbSet<TEntity> _dbSet;

        public Repository(WorkoutsContext context)
        {
            _context = context;
            _context.Exercises.Include(x => x.ExerciseTargetAreaLinks);
            _context.ExerciseTargetAreaLinks.Include(x => x.TargetArea);
            _dbSet = _context.Set<TEntity>();
        }

        public IQueryable<TEntity> Get()
        {
            return _dbSet.AsQueryable();
        }

        public IQueryable<TEntity> GetWithoutTracking()
        {
            return _dbSet.AsNoTracking().AsQueryable();
        }

        public TEntity Get(int id)
        {
            return _dbSet.Find(id);
        }

        public TEntity GetWithoutTracking(int id)
        { 
            return _dbSet.AsNoTracking().FirstOrDefault(x => x.Id == id);
        }

        public TEntity Add(TEntity entity, bool saveChanges = false)
        {
            entity.CreatedDateTime = DateTime.Now.ToUniversalTime();
            _context.Add<TEntity>(entity);

            if (saveChanges)
                _context.SaveChanges(); //Save();

            return entity;
        }

        /*
        public Task<TEntity> AddAsync(TEntity entity, bool saveChanges = false)
        {
            entity.CreatedDateTime = DateTime.Now;
            _context.AddAsync<TEntity>(entity);

            if (saveChanges)
                SaveAsync();

            return Task.FromResult<TEntity>(entity);
        }
        */

        public TEntity Update(TEntity entity, bool saveChanges = false)
        {
            entity.ModifiedDateTime = DateTime.Now.ToUniversalTime();
            _context.Update<TEntity>(entity);

            if (saveChanges)
                _context.SaveChanges(); //Save();

            return entity;
        }

        public void Delete(int id)
        {
            _context.Remove<TEntity>(Get(id));
            _context.SaveChanges();
        }

        //TODO: Re-evaluate. I don't think this method is needed.
        /*
        public virtual void Save()
        {
            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                //TODO: Log
                //TODO: Handle different exception types
                throw;
            }
        }

        //TODO: Re-evaluate. I don't think this method is needed.
        public virtual Task SaveAsync()
        {
            try
            {
                return _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                //TODO: Log
                //TODO: Handle different exception types
                throw;
            }
        }
        */

        public void SetValues(TEntity target, TEntity source)
        {
            _context.Entry<TEntity>(target).CurrentValues.SetValues(source);
        }

        public async Task<int> UpdateAsync<T>(T entity, params Expression<Func<T, object>>[] navigations) where T : Entity
        {
            //This code is from the following URL, with a few minor modifications:
            //https://entityframeworkcore.com/knowledge-base/55088933/update-parent-and-child-collections-on-generic-repository-with-ef-core

            var dbEntity = await _context.FindAsync<T>(entity.Id);

            var dbEntry = _context.Entry(dbEntity);
            dbEntry.CurrentValues.SetValues(entity);

            foreach (var property in navigations)
            {
                var propertyName = property.GetPropertyAccess().Name;
                var dbItemsEntry = dbEntry.Collection(propertyName);
                var accessor = dbItemsEntry.Metadata.GetCollectionAccessor();

                await dbItemsEntry.LoadAsync();
                var dbItemsMap = ((IEnumerable<Entity>)dbItemsEntry.CurrentValue)
                    .ToDictionary(e => e.Id);

                var items = (IEnumerable<Entity>)accessor.GetOrCreate(entity, false);

                foreach (var item in items)
                {
                    if (!dbItemsMap.TryGetValue(item.Id, out var oldItem))
                        accessor.Add(dbEntity, item, false);
                    else
                    {
                        _context.Entry(oldItem).CurrentValues.SetValues(item);
                        dbItemsMap.Remove(item.Id);
                    }
                }

                foreach (var oldItem in dbItemsMap.Values)
                    accessor.Remove(dbEntity, oldItem);
            }

            return await _context.SaveChangesAsync();
        }

        public bool Any()
        {
            return _dbSet.Any();
        }

        public bool Any(Expression<Func<TEntity, bool>> predicate)
        {
            return _dbSet.Any(predicate);
        }
    }
}
