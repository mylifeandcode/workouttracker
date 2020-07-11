using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;
using WorkoutTracker.Application.FilterClasses;

namespace WorkoutTracker.Application.Exercises
{
    public class ExerciseService : ServiceBase<Exercise>, IExerciseService
    {
        public ExerciseService(IRepository<Exercise> repo) : base(repo) { }

        public IEnumerable<Exercise> Get(int firstRecord, short pageSize, ExerciseFilter filter)
        {
            IQueryable<Exercise> query = _repo.Get();

            if (filter != null)
                ApplyQueryFilters(ref query, filter);

            var output = query.Skip(firstRecord).Take(pageSize);
            return output;
        }

        public override Exercise Update(Exercise modifiedExercise, bool saveChanges = false)
        {
            /*
            Remove any ExerciseTargetAreaLinks which are not present in entity.
            I thought there'd be an easier way to handle this, but as this is a 
            disconnected entity, apparently there is not. :/
            See https://docs.microsoft.com/en-us/ef/core/saving/disconnected-entities for 
            more info.
            */
            var existingExercise = _repo.Get(modifiedExercise.Id); //Once we do this, this entity is TRACKED
            _repo.SetValues(existingExercise, modifiedExercise);

            AddExerciseTargetAreaLinksToExistingExercise(existingExercise, modifiedExercise);
            RemoveExerciseTargetAreaLinksToExistingExercise(existingExercise, modifiedExercise);

            existingExercise.ModifiedDateTime = DateTime.Now;

            if (saveChanges)
                _repo.Context.SaveChanges(); //Have to save this way because our entity is already TRACKED.
                                             //TODO: Refactor? I'm not thrilled with this approach.

            return existingExercise;
        }

        private void ApplyQueryFilters(ref IQueryable<Exercise> query, ExerciseFilter filter)
        {
            if (filter == null)
                return;

            if (!String.IsNullOrWhiteSpace(filter.NameContains))
                query = query.Where(x => x.Name.Contains(filter.NameContains));

            if (filter.HasTargetAreas != null && filter.HasTargetAreas.Any())
            {
                //filter.HasTargetAreas.ForEach((targetArea) =>
                foreach (var targetArea in filter.HasTargetAreas)
                {
                    query = query.Where(x => x.ExerciseTargetAreaLinks.Any(links => links.TargetArea.Name.ToUpper().Contains(targetArea.ToUpper())));
                }
            }
        }

        private void AddExerciseTargetAreaLinksToExistingExercise(Exercise existingExercise, Exercise modifiedExercise)
        {
            foreach (var link in modifiedExercise.ExerciseTargetAreaLinks)
            {
                var existingLink =
                    existingExercise.ExerciseTargetAreaLinks
                        .FirstOrDefault(x => x.TargetAreaId == link.TargetAreaId);

                if (existingLink == null)
                    existingExercise.ExerciseTargetAreaLinks.Add(link);
            }
        }

        private void RemoveExerciseTargetAreaLinksToExistingExercise(Exercise existingExercise, Exercise modifiedExercise)
        {
            var linksToRemove = new List<ExerciseTargetAreaLink>(modifiedExercise.ExerciseTargetAreaLinks.Count);
            foreach (var existingLink in existingExercise.ExerciseTargetAreaLinks)
            {
                if (!modifiedExercise.ExerciseTargetAreaLinks.Any(x => x.TargetAreaId == existingLink.TargetAreaId))
                    linksToRemove.Add(existingLink);
            }

            foreach (var link in linksToRemove)
                existingExercise.ExerciseTargetAreaLinks.Remove(link);
        }
    }
}
