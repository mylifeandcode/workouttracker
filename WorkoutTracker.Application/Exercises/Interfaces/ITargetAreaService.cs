using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Interfaces
{
    public interface ITargetAreaService
    {
        IEnumerable<TargetArea> GetAll();
        TargetArea Get(int id);
        IEnumerable<TargetArea> GetByIds(int[] ids);
    }
}
