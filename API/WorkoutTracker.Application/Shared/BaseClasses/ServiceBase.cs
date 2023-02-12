using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutTracker.Repository;
using WorkoutTracker.Application.Shared.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Application.Shared.BaseClasses
{
    public abstract class ServiceBase<T> : IServiceBase<T>
    {
        protected IRepository<T> _repo;
        protected ILogger _logger;

        public ServiceBase(IRepository<T> repo, ILogger logger)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
