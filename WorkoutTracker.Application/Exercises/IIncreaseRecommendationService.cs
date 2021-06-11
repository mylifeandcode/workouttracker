using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Users;

namespace WorkoutTracker.Application.Exercises
{
    public interface IIncreaseRecommendationService
    {
        ExerciseAmountRecommendation GetIncreaseRecommendation(
            ExecutedExercise executedExercise,
            UserSettings userSettings);
    }
}
