using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Exercises.Models;

namespace WorkoutTracker.Application.Exercises.Interfaces
{
    public interface IIncreaseRecommendationService
    {
        Task<ExerciseAmountRecommendation> GetIncreaseRecommendationAsync(
            ExecutedExerciseAverages executedExerciseAverages,
            UserSettings userSettings);
    }
}
