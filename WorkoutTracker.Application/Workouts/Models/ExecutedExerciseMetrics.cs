using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Workouts.Models
{
    public class ExecutedExerciseMetrics
    {
        public string Name { get; set; }
        public short Sequence { get; set; }
        public SetType SetType { get; set; }
        public double AverageRepCount { get; set; }
        public decimal AverageResistanceAmount { get; set; }
        public double AverageForm { get; set; }
        public double AverageRangeOfMotion { get; set; }

        public ExecutedExerciseMetrics(List<ExecutedExercise> executedExercises)
        {
            if (executedExercises != null && executedExercises.Any())
            {
                Name = executedExercises[0].Exercise.Name;
                Sequence = executedExercises[0].Sequence;
                SetType = executedExercises[0].SetType;
                AverageRepCount = executedExercises.Average(x => x.ActualRepCount);
                AverageResistanceAmount = executedExercises.Average(x => x.ResistanceAmount);
                AverageForm = executedExercises.Average(x => x.FormRating);
                AverageRangeOfMotion = executedExercises.Average(x => x.RangeOfMotionRating);
            }
        }
    }
}
