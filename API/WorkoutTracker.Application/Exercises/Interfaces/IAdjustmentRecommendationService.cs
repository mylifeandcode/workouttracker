using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Exercises.Models;

namespace WorkoutTracker.Application.Exercises.Interfaces
{
    public interface IAdjustmentRecommendationService
    {
        Task<ExerciseAmountRecommendation> GetAdjustmentRecommendationAsync(
            ExecutedExerciseAverages executedExerciseAverages,
            UserSettings userSettings);
    }
}
