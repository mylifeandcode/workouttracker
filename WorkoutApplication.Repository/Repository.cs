using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
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
    }
}
