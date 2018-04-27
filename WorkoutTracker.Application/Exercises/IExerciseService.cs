using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises
{
    public interface IExerciseService
    {
        Exercise Add(Exercise exercise, bool saveChanges = false);
        Exercise Update(Exercise exercise, bool saveChanges = false);
        void Delete(int exerciseId);
        IEnumerable<Exercise> GetAll();
        Exercise GetById(int exerciseId);
    }
}
