using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Models
{
    public class ExecutedExerciseAverages
    {
        public Exercise Exercise { get; }
        public SetType SetType { get; }
        public double? AverageDuration { get; }
        public double AverageTargetRepCount { get; }
        public decimal AverageResistanceAmount { get; }
        public double AverageActualRepCount { get; }
        public double AverageFormRating { get; }
        public double AverageRangeOfMotionRating { get; }
        public ExecutedExercise LastExecutedSet { get; }

        public ExecutedExerciseAverages(List<ExecutedExercise> executedExercises)
        {
            if (executedExercises == null) throw new ArgumentNullException(nameof(executedExercises));
            if (!executedExercises.Any()) throw new ArgumentException("executedExercises is empty.");
            
            Exercise = executedExercises[0].Exercise;
            SetType = executedExercises[0].SetType;
            
            if (executedExercises[0].Duration != null)
                AverageDuration = executedExercises.Average(x => x.Duration);

            AverageTargetRepCount = executedExercises.Average(x => x.TargetRepCount);
            AverageActualRepCount = executedExercises.Average(x => x.ActualRepCount);
            AverageResistanceAmount = executedExercises.Average(x => x.ResistanceAmount);
            AverageFormRating = executedExercises.Average(x => x.FormRating);
            AverageRangeOfMotionRating = executedExercises.Average(x => x.RangeOfMotionRating);

            LastExecutedSet = executedExercises.Last();
        }
    }
}
