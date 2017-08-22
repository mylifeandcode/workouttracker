using System;
using System.Collections.Generic;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Repository;

namespace WorkoutTracker.Application.Exercises
{
    public class TargetAreaService : ITargetAreaService
    {
        protected readonly IRepository<TargetArea> _repo;

        public TargetAreaService(IRepository<TargetArea> repo)
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
