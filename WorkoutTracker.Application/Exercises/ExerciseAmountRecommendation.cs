using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Application.Exercises
{
    public class ExerciseAmountRecommendation
    {
        public int ExerciseId { get; set; }
        public decimal ResistanceAmount { get; set; }
        public string ResistanceMakeup { get; set; }
        public int Reps { get; set; }
        public string Reason { get; set; }
    }
}
