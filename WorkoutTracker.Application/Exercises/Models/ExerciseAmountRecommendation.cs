using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Models
{
    public class ExerciseAmountRecommendation
    {
        public int ExerciseId { get; set; }
        public decimal ResistanceAmount { get; set; }
        public string ResistanceMakeup { get; set; }
        public byte Reps { get; set; }
        public string Reason { get; set; }

        public ExerciseAmountRecommendation() { }

        public ExerciseAmountRecommendation(ExecutedExerciseAverages averages, string reason)
        {
            if (averages == null) throw new ArgumentNullException(nameof(averages));
            if (string.IsNullOrEmpty(reason)) throw new ArgumentNullException(nameof(reason));

            ExerciseId = averages.Exercise.Id;
            Reps = averages.LastExecutedSet.ActualRepCount;
            ResistanceAmount = averages.LastExecutedSet.ResistanceAmount;
            ResistanceMakeup = averages.LastExecutedSet.ResistanceMakeup;

            Reason = reason;
        }

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
