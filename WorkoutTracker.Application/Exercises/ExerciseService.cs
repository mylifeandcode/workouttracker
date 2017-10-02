using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;

namespace WorkoutTracker.Application.Exercises
{
    public class ExerciseService : ServiceBase<Exercise>, IExerciseService
    {
        public ExerciseService(IRepository<Exercise> repo) : base(repo) { }
    }
}
