using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Repository;
using WorkoutTracker.Application.Shared.BaseClasses;
using WorkoutTracker.Application.Workouts.Interfaces;

namespace WorkoutTracker.Application.Workouts.Services
{
    public class WorkoutService : ServiceBase<Workout>, IWorkoutService
    {
        public WorkoutService(IRepository<Workout> repo) : base(repo) { }

        public IEnumerable<Workout> Get(int firstRecord, short pageSize, WorkoutFilter filter)
        {
            IQueryable<Workout> query = _repo.Get();

            if (filter != null)
                ApplyQueryFilters(ref query, filter);

            var output = query.Skip(firstRecord).Take(pageSize);
            return output;
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

        public void Retire(int workoutId)
        {
            SetActive(workoutId, false);
        }

        public void Reactivate(int workoutId)
        {
            SetActive(workoutId, true);
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

        private void SetActive(int workoutId, bool active)
        {
            try
            {
                var workout = _repo.Get().First(x => x.Id == workoutId);
                workout.Active = active;
                workout.ModifiedByUserId = workout.CreatedByUserId;
                workout.ModifiedDateTime = DateTime.Now;
                _repo.Update(workout, true);
            }
            catch (Exception ex)
            {
                //TODO: Log
                throw;
            }
        }
    }
}
