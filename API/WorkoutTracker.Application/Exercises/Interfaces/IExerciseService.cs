using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Application.Exercises.Models;

namespace WorkoutTracker.Application.Exercises.Interfaces
{
    public interface IExerciseService
    {
        Exercise Add(Exercise exercise, bool saveChanges = false);
        Exercise Update(Exercise exercise, bool saveChanges = false);
        void Delete(int exerciseId);
        IEnumerable<Exercise> Get(int firstRecord, short pageSize, ExerciseFilter filter);
        int GetTotalCount();
        Exercise GetById(int exerciseId);
        Exercise GetByPublicId(Guid publicId);
        Dictionary<int, string> GetResistanceTypes();
        int GetTotalCount(ExerciseFilter filter);
    }
}
