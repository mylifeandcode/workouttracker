using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Tests.TestHelpers.Builders
{
    public class ExerciseBuilder : Builder<Exercise>
    {
        protected override void Reset()
        {
            base.Reset();
            _output.ExerciseTargetAreaLinks = new List<ExerciseTargetAreaLink>();
        }
    }
}
