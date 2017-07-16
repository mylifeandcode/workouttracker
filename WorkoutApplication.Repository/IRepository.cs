using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WorkoutApplication.Repository
{
    public interface IRepository<TEntity>
    {
        IQueryable<TEntity> Get();
        TEntity Get(int id);
    }
}
