using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutTracker.Application
{
    public interface ITargetAreasService
    {
        IEnumerable<TargetArea> GetAll();
        TargetArea Get(int id);
    }
}
