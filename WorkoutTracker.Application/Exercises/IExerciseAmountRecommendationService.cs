using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Users;

namespace WorkoutTracker.Application.Exercises
{
    public interface IExerciseAmountRecommendationService
    {
        ExerciseAmountRecommendation GetRecommendation(int exerciseId, UserSettings userSettings = null);
    }
}
