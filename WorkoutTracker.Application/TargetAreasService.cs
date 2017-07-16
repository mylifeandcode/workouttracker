using System;
using System.Collections.Generic;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Repository;

namespace WorkoutTracker.Application
{
    public class TargetAreasService : ITargetAreasService
    {
        protected readonly IRepository<TargetArea> _repo;

        public TargetAreasService(IRepository<TargetArea> repo)
        {
            _repo = repo;
        }

        public TargetArea Get(int id)
        {
            return _repo.Get(id);
        }

        public IEnumerable<TargetArea> GetAll()
        {
            return _repo.Get();
        }
    }
}
