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
            /*
            I thought there'd be an easier way to handle this, but as this is a 
            disconnected entity, apparently there is not. :/
            See https://docs.microsoft.com/en-us/ef/core/saving/disconnected-entities for 
            more info.
            */
            //TODO: Revisit the logic for removing exercises, as maybe EF Core has/will have changed

            var existingWorkout = _repo.Get(modifiedWorkout.Id); //Once we do this, this entity is TRACKED
            _repo.SetValues(existingWorkout, modifiedWorkout);

            //Before adding logic to remove from the existing workout, newly added exercises 
            //with an ID of 0 were persisted correctly. But because I need to load the existing 
            //workout for tracking purposes, and modify *that*, I now *also* have to take steps 
            //to add the newly added exercises.
            //TODO: Find a better way. There has to be one by now.
            AddExercisesToExistingWorkout(existingWorkout, modifiedWorkout);
            RemoveExercisesFromExistingWorkout(existingWorkout, modifiedWorkout);

            _repo.Update(existingWorkout, saveChanges);

            return existingWorkout;
        }

        private void ApplyQueryFilters(ref IQueryable<Workout> query, WorkoutFilter filter)
        {
            if (filter == null)
                return;

            if (!String.IsNullOrWhiteSpace(filter.NameContains))
                query = query.Where(x => x.Name.Contains(filter.NameContains, StringComparison.CurrentCultureIgnoreCase));
        }

        private void AddExercisesToExistingWorkout(Workout existingWorkout, Workout modifiedWorkout)
        {
            foreach (var exercise in modifiedWorkout.Exercises)
            {
                var existingExercise =
                    existingWorkout.Exercises
                        .FirstOrDefault(x => x.Id == exercise.Id);

                if (existingExercise == null)
                    existingWorkout.Exercises.Add(exercise);
            }
        }

        private void RemoveExercisesFromExistingWorkout(Workout existingWorkout, Workout modifiedWorkout)
        {
            //Loop through exercises in the existing workout which are no longer found in the modified 
            //workout, and remove them.
            var exercisesToRemove = new List<ExerciseInWorkout>(modifiedWorkout.Exercises.Count);
            foreach (var existingExercise in existingWorkout.Exercises)
            {
                if (!modifiedWorkout.Exercises.Any(x => x.Id == existingExercise.Id))
                    exercisesToRemove.Add(existingExercise);
            }

            foreach (var exercise in exercisesToRemove)
                existingWorkout.Exercises.Remove(exercise);
        }
    }
}
