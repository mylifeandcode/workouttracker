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
            IQueryable<Exercise> query = _repo.Get().Include(x => x.ExerciseTargetAreaLinks);
            ApplyQueryFilters(query, filter);
            return query.Skip(firstRecord).Take(pageSize);
        }

        public override Exercise GetById(int id)
        {
            return base.GetById(id);
        }

        public int GetTotalCount()
        {
            return _repo.Get().Count();
        }

        private void ApplyQueryFilters(IQueryable<Exercise> query, ExerciseFilter filter)
        {
            if (!String.IsNullOrWhiteSpace(filter.NameContains))
                query = query.Where(x => x.Name.Contains(filter.NameContains));

            if (filter.HasTargetAreas != null && filter.HasTargetAreas.Any())
            {
                filter.HasTargetAreas.ForEach((targetArea) =>
                    query = query.Where(x => x.ExerciseTargetAreaLinks.Any(links => links.TargetArea.Name == targetArea)));
            }
        }
    }
}
