using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Repository;
using WorkoutTracker.Application.Exercises.Interfaces;

namespace WorkoutTracker.Application.Exercises.Services
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

        public IEnumerable<TargetArea> GetByIds(int[] ids)
        {
            return _repo.Get().Where(x => ids.Contains(x.Id));
        }
    }
}
