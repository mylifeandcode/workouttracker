using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutTracker.Repository;
using WorkoutTracker.Application.Shared.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace WorkoutTracker.Application.Shared.BaseClasses
{
    public abstract class ServiceBase<T> : IServiceBase<T>
    {
        protected IRepository<T> _repo;

        public ServiceBase(IRepository<T> repo)
        {
            if (repo == null)
                throw new ArgumentNullException(nameof(repo));

            _repo = repo;
        }

        public virtual IEnumerable<T> GetAll()
        {
            return _repo.Get();
        }

        public virtual T GetById(int id)
        {
            return _repo.Get(id);
        }

        public virtual T Add(T entity, bool saveChanges = false)
        {
            return _repo.Add(entity, saveChanges);
        }

        public virtual T Update(T entity, bool saveChanges = false)
        {
            return _repo.Update(entity, saveChanges);
        }

        public virtual void Delete(int entityId)
        {
            _repo.Delete(entityId);
        }

        public int GetTotalCount()
        {
            return _repo.Get().Count();
        }
    }
}
