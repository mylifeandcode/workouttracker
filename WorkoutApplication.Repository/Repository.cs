using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using WorkoutApplication.Data;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Repository
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

        public TEntity Get(int id)
        {
            return _dbSet.Find(id);
        }

        public TEntity Add(TEntity entity, bool saveChanges = false)
        {
            entity.CreatedDateTime = DateTime.Now;
            _context.Add<TEntity>(entity);

            if (saveChanges)
                Save();

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
            entity.ModifiedDateTime = DateTime.Now;
            _context.Update<TEntity>(entity);

            if (saveChanges)
                Save();

            return entity;
        }

        public void Delete(int id)
        {
            _context.Remove<TEntity>(Get(id));
            _context.SaveChanges();
        }

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

    }
}
