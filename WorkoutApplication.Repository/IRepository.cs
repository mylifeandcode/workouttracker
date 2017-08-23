using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorkoutApplication.Repository
{
    public interface IRepository<TEntity>
    {
        IQueryable<TEntity> Get();
        TEntity Get(int id);
        TEntity Add(TEntity entity, bool saveChanges = false);
        Task<TEntity> AddAsync(TEntity entity, bool saveChanges = false);
        void Save();
        Task SaveAsync();
    }
}
