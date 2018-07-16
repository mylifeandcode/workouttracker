using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises
{
    public interface ITargetAreaService
    {
        IEnumerable<TargetArea> GetAll();
        TargetArea Get(int id);
        IEnumerable<TargetArea> GetByIds(int[] ids);
    }
}
