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

        public IEnumerable<Exercise> Get(short startPage, short pageSize, ExerciseFilter filter)
        {
            IQueryable<Exercise> query = _repo.Get();
            ApplyQueryFilters(query, filter);
            return query.Skip((startPage - 1) * pageSize).Take(pageSize);
        }

        private void ApplyQueryFilters(IQueryable<Exercise> query, ExerciseFilter filter)
        {
            if (!String.IsNullOrWhiteSpace(filter.NameContains))
                query = query.Where(x => x.Name.Contains(filter.NameContains));

            if (filter.HasTargetAreas.Any())
            {
                filter.HasTargetAreas.ForEach((targetArea) =>
                    query = query.Where(x => x.ExerciseTargetAreaLinks.Any(links => links.TargetArea.Name == targetArea)));
            }
        }
    }
}
