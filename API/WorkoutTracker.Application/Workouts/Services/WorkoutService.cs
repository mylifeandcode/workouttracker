using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Application.Shared.BaseClasses;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Workouts.Services
{
    public class WorkoutService : PublicEntityServiceBase<Workout>, IWorkoutService
    {
        public WorkoutService(IRepository<Workout> repo, ILogger<WorkoutService> logger) : base(repo, logger) { }

        public async Task<IEnumerable<Workout>> GetAsync(int firstRecord, short pageSize, WorkoutFilter filter)
        {
            IQueryable<Workout> query = _repo.GetWithoutTracking();

            if (filter != null)
                ApplyQueryFilters(ref query, filter);

            return await query.Skip(firstRecord).Take(pageSize).ToListAsync();
        }

        public override async Task<Workout> UpdateAsync(Workout modifiedWorkout, bool saveChanges = false)
        {
            if (modifiedWorkout == null)
                throw new ArgumentNullException(nameof(modifiedWorkout));

            await _repo.UpdateAsync(modifiedWorkout, (workout) => workout.Exercises);

            return modifiedWorkout;
        }

        public async Task RetireAsync(Guid publicId)
        {
            await SetActiveAsync(publicId, false);
        }

        public async Task ReactivateAsync(Guid publicId)
        {
            await SetActiveAsync(publicId, true);
        }

        public async Task<int> GetTotalCountAsync(WorkoutFilter filter)
        {
            var query = _repo.GetWithoutTracking();
            ApplyQueryFilters(ref query, filter);
            return await query.CountAsync();
        }

        private static void ApplyQueryFilters(ref IQueryable<Workout> query, WorkoutFilter filter)
        {
            if (filter == null)
                return;

            query = query.Where(workout => workout.CreatedByUserId == filter.UserId);

            if (filter.ActiveOnly)
                query = query.Where(workout => workout.Active);

            if (!string.IsNullOrWhiteSpace(filter.NameContains))
                query = query.Where(workout => EF.Functions.Like(workout.Name, "%" + filter.NameContains + "%"));
        }

        private async Task SetActiveAsync(Guid workoutPublicId, bool active)
        {
            try
            {
                var workout = await _repo.Get().FirstAsync(x => x.PublicId == workoutPublicId);
                workout.Active = active;
                workout.ModifiedByUserId = workout.CreatedByUserId;
                workout.ModifiedDateTime = DateTime.Now;
                await _repo.UpdateAsync(workout, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, null, [workoutPublicId, active]);
                throw;
            }
        }
    }
}
