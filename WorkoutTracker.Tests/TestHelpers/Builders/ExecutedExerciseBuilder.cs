using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Resistances;

namespace WorkoutTracker.Tests.TestHelpers.Builders
{
    public class ExecutedExerciseBuilder : Builder<ExecutedExercise>
    {
        protected override void Reset()
        {
            base.Reset();
            _output.Resistances = new List<Resistance>();
        }
    }
}
