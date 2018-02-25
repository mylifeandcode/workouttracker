using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Repository;

namespace WorkoutTracker.Application.BaseClasses
{
    public abstract class ServiceBase<T>
    {
        protected IRepository<T> _repo;

        public ServiceBase(IRepository<T> repo)
        {
            if (repo == null)
                throw new ArgumentNullException("repo");

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
    }
}
