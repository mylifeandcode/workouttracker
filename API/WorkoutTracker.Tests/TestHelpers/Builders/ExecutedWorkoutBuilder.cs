using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Tests.TestHelpers.Builders
{
    public class ExecutedWorkoutBuilder : Builder<ExecutedWorkout>
    {
        protected override void Reset()
        {
            base.Reset();
            _output.Exercises = new List<ExecutedExercise>();
        }
    }
}
