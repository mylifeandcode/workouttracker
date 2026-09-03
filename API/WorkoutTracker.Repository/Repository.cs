using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
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
    public class Repository<TEntity> : IRepository<TEntity> where TEntity : Entity
    {
        protected WorkoutsContext _context;
        protected DbSet<TEntity> _dbSet;

        public Repository(WorkoutsContext context)
        {
            _context = context;
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

        public async Task<TEntity?> GetAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet.FindAsync([id], cancellationToken);
        }

        public async Task<TEntity?> GetWithoutTrackingAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet.ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<TEntity>> GetAllWithoutTrackingAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet.AsNoTracking().ToListAsync(cancellationToken);
        }

        public async Task<TEntity> AddAsync(TEntity entity, bool saveChanges = false, CancellationToken cancellationToken = default)
        {
            entity.CreatedDateTime = DateTime.Now.ToUniversalTime();
            await _context.AddAsync<TEntity>(entity, cancellationToken);

            if (saveChanges)
                await _context.SaveChangesAsync(cancellationToken);

            return entity;
        }

        public async Task<TEntity> UpdateAsync(TEntity entity, bool saveChanges = false, CancellationToken cancellationToken = default)
        {
            entity.ModifiedDateTime = DateTime.Now.ToUniversalTime();
            _context.Update<TEntity>(entity);

            if (saveChanges)
                await _context.SaveChangesAsync(cancellationToken);

            return entity;
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _dbSet.FindAsync([id], cancellationToken);
            _context.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public void SetValues(TEntity target, TEntity source)
        {
            _context.Entry<TEntity>(target).CurrentValues.SetValues(source);
        }

        public async Task<int> UpdateAsync<T>(T entity, params Expression<Func<T, object>>[] navigations) where T : Entity
        {
            return await UpdateAsync(entity, default, navigations);
        }

        public async Task<int> UpdateAsync<T>(T entity, CancellationToken cancellationToken, params Expression<Func<T, object>>[] navigations) where T : Entity
        {
            //This code is from the following URL, with a few minor modifications:
            //https://entityframeworkcore.com/knowledge-base/55088933/update-parent-and-child-collections-on-generic-repository-with-ef-core

            var dbEntity = await _context.FindAsync<T>([entity.Id], cancellationToken);

            var dbEntry = _context.Entry(dbEntity);
            dbEntry.CurrentValues.SetValues(entity);

            foreach (var property in navigations)
            {
                var propertyName = property.GetPropertyAccess().Name;
                var dbItemsEntry = dbEntry.Collection(propertyName);
                var accessor = dbItemsEntry.Metadata.GetCollectionAccessor();

                await dbItemsEntry.LoadAsync(cancellationToken);
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

            return await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> AnyAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet.AnyAsync(cancellationToken);
        }

        public async Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AnyAsync(predicate, cancellationToken);
        }

        public async Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet.CountAsync(cancellationToken);
        }
    }
}
