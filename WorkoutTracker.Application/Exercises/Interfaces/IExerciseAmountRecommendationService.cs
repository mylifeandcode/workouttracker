using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Application.Exercises.Models;

namespace WorkoutTracker.Application.Exercises.Interfaces
{
    /// <summary>
    /// An interface for providing recommendations for the amount of reps and resistance 
    /// to attempt when performing an exercise.
    /// </summary>
    public interface IExerciseAmountRecommendationService
    {
        /// <summary>
        /// Gets an ExerciseAmountRecommendation based on the last workout the exercise 
        /// was performed in (if any) and the user's settings.
        /// </summary>
        /// <param name="exercise">The Exercise to get a recommendation for.</param>
        /// <param name="lastWorkoutWithThisExercise">The last ExecutedWorkout containing the Exercise.</param>
        /// <param name="userSettings">The user's settings.</param>
        /// <returns>
        /// An ExerciseAmountRecommendation containing the recommended reps and 
        /// resistance to attempt
        /// </returns>
        ExerciseAmountRecommendation GetRecommendation(
            Exercise exercise,
            ExecutedWorkout lastWorkoutWithThisExercise,
            UserSettings userSettings = null);
    }
}
