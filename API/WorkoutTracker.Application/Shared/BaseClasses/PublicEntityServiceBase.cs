using System;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Repository;
using Microsoft.Extensions.Logging;
using System.Linq;
using WorkoutTracker.Domain.Interfaces;

namespace WorkoutTracker.Application.Shared.BaseClasses
{
    public abstract class PublicEntityServiceBase<T> : ServiceBase<T>, IPublicEntityServiceBase<T> where T : IPublicEntity
    {
        public PublicEntityServiceBase(IRepository<T> repo, ILogger logger): base(repo, logger) { }

        public T GetByPublicID(Guid publicId)
        {
            return _repo.GetWithoutTracking().FirstOrDefault(x => x.PublicId == publicId);
        }

    }
}
