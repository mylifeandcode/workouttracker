using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Application.Exercises
{
    public interface IExerciseAmountRecommendationService
    {
        ExerciseAmountRecommendation GetRecommendation(int exerciseId);
    }
}
