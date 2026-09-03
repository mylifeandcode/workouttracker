using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Repository;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Application.Exercises.Services
{
    public class TargetAreaService : ITargetAreaService
    {
        protected readonly IRepository<TargetArea> _repo;
        protected readonly ILogger<TargetAreaService> _logger;

        public TargetAreaService(IRepository<TargetArea> repo, ILogger<TargetAreaService> logger)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<TargetArea?> GetAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _repo.GetAsync(id, cancellationToken);
        }

        public async Task<IEnumerable<TargetArea>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _repo.GetAllWithoutTrackingAsync(cancellationToken);
        }

        public async Task<IEnumerable<TargetArea>> GetByIdsAsync(int[] ids, CancellationToken cancellationToken = default)
        {
            return await _repo.GetWithoutTracking().Where(x => ids.Contains(x.Id)).ToListAsync(cancellationToken);
        }
    }
}
