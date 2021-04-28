using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Users;
using WorkoutApplication.Domain.Workouts;

namespace WorkoutTracker.Application.Exercises
{
    /// <summary>
    /// An interface for providing ExerciseAmountRecommendations.
    /// These provide recommendations for the amount of resistance and repititions for 
    /// sets of a specific exercise.
    /// </summary>
    public interface IExerciseAmountRecommendationService
    {
        ExerciseAmountRecommendation GetRecommendation(
            Exercise exercise, 
            ExecutedWorkout lastWorkoutWithThisExercise, 
            UserSettings userSettings = null);
    }
}
