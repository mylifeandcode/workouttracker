using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Application.Exercises.Models;

namespace WorkoutTracker.Application.Exercises.Interfaces
{
    public interface IExerciseAmountRecommendationService
    {
        Task<ExerciseAmountRecommendation> GetRecommendationAsync(
            Exercise exercise,
            ExecutedWorkout lastWorkoutWithThisExercise,
            UserSettings userSettings);
    }
}
