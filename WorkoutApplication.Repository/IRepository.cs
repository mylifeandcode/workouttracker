using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Data;

namespace WorkoutApplication.Repository
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
    }
}
