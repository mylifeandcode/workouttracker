using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Exercises.Models;

namespace WorkoutTracker.Application.Exercises.Interfaces
{
    public interface IAdjustmentRecommendationService
    {
        ExerciseAmountRecommendation GetAdjustmentRecommendation(
                    ExecutedExerciseAverages executedExerciseAverages,
                    UserSettings userSettings);
    }
}
