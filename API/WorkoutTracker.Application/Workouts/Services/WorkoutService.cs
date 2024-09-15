using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public IEnumerable<Workout> Get(int firstRecord, short pageSize, WorkoutFilter filter)
        {
            IQueryable<Workout> query = _repo.GetWithoutTracking();

            if (filter != null)
                ApplyQueryFilters(ref query, filter);

            var output = query.Skip(firstRecord).Take(pageSize);
            return output;
        }

        public Workout GetByPublicId(Guid publicId)
        {
            return base.GetByPublicID(publicId);
        }

        public override Workout Update(Workout modifiedWorkout, bool saveChanges = false)
        {
            //TODO: Refactor to make async
            //TODO: Refactor method signature to remove saveChanges param

            if (modifiedWorkout == null)
                throw new ArgumentNullException(nameof(modifiedWorkout));

            _repo.UpdateAsync(modifiedWorkout, (workout) => workout.Exercises).Wait();

            return modifiedWorkout;
        }

        public void Retire(Guid publicId)
        {
            SetActive(publicId, false);
        }

        public void Reactivate(Guid publicId)
        {
            SetActive(publicId, true);
        }

        public int GetTotalCount(WorkoutFilter filter)
        {
            var query = _repo.GetWithoutTracking();
            ApplyQueryFilters(ref query, filter);
            return query.Count();
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

        private void SetActive(Guid workoutPublicId, bool active)
        {
            try
            {
                var workout = _repo.Get().First(x => x.PublicId == workoutPublicId);
                workout.Active = active;
                workout.ModifiedByUserId = workout.CreatedByUserId;
                workout.ModifiedDateTime = DateTime.Now;
                _repo.Update(workout, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, null, [workoutPublicId, active]);
                throw;
            }
        }
    }
}
