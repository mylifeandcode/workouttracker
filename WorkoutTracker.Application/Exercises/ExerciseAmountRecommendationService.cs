using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Application.Exercises
{
    public class ExerciseAmountRecommendationService : IExerciseAmountRecommendationService
    {
        public ExerciseAmountRecommendation GetRecommendation(int exerciseId)
        {
            //TODO: Implement
            return new ExerciseAmountRecommendation
            {
                ExerciseId = exerciseId, 
                Reps = 10, 
                ResistanceAmount = 5, 
                ResistanceMakeup = "Green"
            };
        }
    }
}
