using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Workouts;

namespace WorkoutTracker.Tests.TestHelpers.Builders
{
    public class WorkoutBuilder : Builder<Workout>
    {
        protected override void Reset()
        {
            base.Reset();
            _output.Exercises = new List<ExerciseInWorkout>();
        }
    }
}
