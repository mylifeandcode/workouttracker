using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Workouts;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;
using WorkoutTracker.Application.FilterClasses;

namespace WorkoutTracker.Application.Workouts
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

            _repo.UpdateAsync<Workout>(modifiedWorkout, (workout) => workout.Exercises).Wait();

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

            if (!String.IsNullOrWhiteSpace(filter.NameContains))
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
