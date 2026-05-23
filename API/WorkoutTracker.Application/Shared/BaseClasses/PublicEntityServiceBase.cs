using System;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Repository;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Interfaces;

namespace WorkoutTracker.Application.Shared.BaseClasses
{
    public abstract class PublicEntityServiceBase<T> : ServiceBase<T>, IPublicEntityServiceBase<T> where T : IPublicEntity
    {
        public PublicEntityServiceBase(IRepository<T> repo, ILogger logger): base(repo, logger) { }

        public async Task<T?> GetByPublicIDAsync(Guid publicId)
        {
            return await _repo.GetWithoutTracking().FirstOrDefaultAsync(x => x.PublicId == publicId);
        }
    }
}
