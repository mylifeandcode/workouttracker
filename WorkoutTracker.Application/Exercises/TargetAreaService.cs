using System;
using System.Collections.Generic;
using System.Linq;
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

        public IEnumerable<TargetArea> GetByIds(int[] ids)
        {
            return _repo.Get().Where(x => ids.Contains(x.Id));
        }
    }
}
