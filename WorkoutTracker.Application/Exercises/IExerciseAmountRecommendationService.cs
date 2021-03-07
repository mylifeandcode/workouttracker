using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Users;
using WorkoutApplication.Domain.Workouts;

namespace WorkoutTracker.Application.Exercises
{
    public interface IExerciseAmountRecommendationService
    {
        ExerciseAmountRecommendation GetRecommendation(
            Exercise exercise, 
            ExecutedWorkout lastWorkoutWithThisExercise, 
            UserSettings userSettings = null);
    }
}
