using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;
using WorkoutTracker.Application.FilterClasses;

namespace WorkoutTracker.Application.Exercises
{
    public interface IExerciseService
    {
        Exercise Add(Exercise exercise, bool saveChanges = false);
        Exercise Update(Exercise exercise, bool saveChanges = false);
        void Delete(int exerciseId);
        IEnumerable<Exercise> Get(short startPage, short pageSize, ExerciseFilter filter);
        int GetTotalCount();
        Exercise GetById(int exerciseId);
    }
}
