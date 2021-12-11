using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Application.Workouts;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Users;
using WorkoutApplication.Domain.Workouts;
using WorkoutTracker.Application.Exercises;
using WorkoutTracker.Application.Users;

namespace WorkoutTracker.Application.Workouts
{
    public class WorkoutPlanService : IWorkoutPlanService
    {
        private IWorkoutService _workoutService;
        private IExecutedWorkoutService _executedWorkoutService;
        private IUserService _userService;
        private IExerciseAmountRecommendationService _recommendationService;
        

        public WorkoutPlanService(
            IWorkoutService workoutService,
            IExecutedWorkoutService executedWorkoutService,
            IUserService userService,
            IExerciseAmountRecommendationService recommendationService)
        {
            _workoutService = workoutService ?? throw new ArgumentNullException(nameof(workoutService));
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _recommendationService = recommendationService ?? throw new ArgumentNullException(nameof(recommendationService));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        }

        public WorkoutPlan Create(int workoutId, int userId)
        {
            try
            {
                ExecutedWorkout lastExecutedWorkout = _executedWorkoutService.GetLatest(workoutId);

                if (lastExecutedWorkout == null)
                    return CreatePlanForNewWorkout(workoutId, userId);
                else
                    return CreatePlanForExecutedWorkout(lastExecutedWorkout);
            }
            catch (Exception ex)
            {
                //TODO: Log
                throw;
            }
        }

        private WorkoutPlan CreatePlanForNewWorkout(int workoutId, int userId)
        {
            Workout workout = _workoutService.GetById(workoutId);
            var userSettings = GetUserSettings(userId);

            var plan = new WorkoutPlan(workout, false);

            if (userSettings != null && userSettings.RecommendationsEnabled)
            {
                foreach (var exercisePlan in plan.Exercises)
                {
                    var exercise = workout.Exercises.First(x => x.ExerciseId == exercisePlan.ExerciseId);
                    var recommendation = _recommendationService.GetRecommendation(exercise.Exercise, null, userSettings);
                    exercisePlan.ApplyRecommendation(recommendation);
                }
            }

            return plan;
        }

        private WorkoutPlan CreatePlanForExecutedWorkout(ExecutedWorkout lastExecutedWorkout)
        {
            var output = new WorkoutPlan(lastExecutedWorkout.Workout, true);
            var exercisesInWorkout = lastExecutedWorkout.Workout.Exercises.ToList();
            var userSettings = GetUserSettings(lastExecutedWorkout.Workout.CreatedByUserId);

            for (short x = 0; x < exercisesInWorkout.Count; x++)
            {
                var exerciseInWorkout = exercisesInWorkout[x];
                var exercisePlan = output.Exercises.First(x => x.Sequence == exerciseInWorkout.Sequence);
                var executedExercises =
                    lastExecutedWorkout
                        .Exercises
                        .Where(x => x.ExerciseId == exerciseInWorkout.ExerciseId);

                exercisePlan.SetLastTimeValues(executedExercises);

                if (userSettings != null && userSettings.RecommendationsEnabled)
                {
                    var recommendation = 
                        _recommendationService.GetRecommendation(
                            exerciseInWorkout.Exercise, lastExecutedWorkout, userSettings);

                    exercisePlan.ApplyRecommendation(recommendation);
                }
            }

            return output;
        }

        private UserSettings GetUserSettings(int userId)
        {
            var user = _userService.GetById(userId);
            if (user == null)
                throw new ApplicationException($"User {userId} not found.");
            else
                return user.Settings;
        }
    }
}
