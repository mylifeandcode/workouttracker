using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises
{
    public class ExerciseAmountRecommendation
    {
        public int ExerciseId { get; set; }
        public decimal ResistanceAmount { get; set; }
        public string ResistanceMakeup { get; set; }
        public byte Reps { get; set; }
        public string Reason { get; set; }

        public ExerciseAmountRecommendation() { }

        public ExerciseAmountRecommendation(ExecutedExercise executedExercise)
        {
            if (executedExercise == null)
                throw new ArgumentNullException(nameof(executedExercise));

            ExerciseId = executedExercise.Exercise.Id;
            ResistanceAmount = executedExercise.ResistanceAmount;
            ResistanceMakeup = executedExercise.ResistanceMakeup;
            Reps = executedExercise.TargetRepCount;
        }
    }
}
