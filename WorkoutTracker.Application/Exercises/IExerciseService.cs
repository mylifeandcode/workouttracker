using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises
{
    public interface IExerciseService
    {
        IEnumerable<Exercise> GetAll();
        Exercise GetById(int id);
    }
}
