using System;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Domain.Workouts;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.Application.Workouts.Services
{
    public class WorkoutPlanService : IWorkoutPlanService
    {
        private IWorkoutService _workoutService;
        private IExecutedWorkoutService _executedWorkoutService;
        private IUserService _userService;
        private IExerciseAmountRecommendationService _recommendationService;
        private ILogger<WorkoutPlanService> _logger;

        public WorkoutPlanService(
            IWorkoutService workoutService,
            IExecutedWorkoutService executedWorkoutService,
            IUserService userService,
            IExerciseAmountRecommendationService recommendationService,
            ILogger<WorkoutPlanService> logger)
        {
            _workoutService = workoutService ?? throw new ArgumentNullException(nameof(workoutService));
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _recommendationService = recommendationService ?? throw new ArgumentNullException(nameof(recommendationService));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<WorkoutPlan> CreateAsync(Guid workoutPublicId, int userId)
        {
            try
            {
                ExecutedWorkout? lastExecutedWorkout = await _executedWorkoutService.GetLatestAsync(workoutPublicId);

                if (lastExecutedWorkout == null)
                    return await CreatePlanForNewWorkoutAsync(workoutPublicId, userId);
                else
                    return await CreatePlanForExecutedWorkoutAsync(lastExecutedWorkout);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in WorkoutPlanService.CreateAsync()");
                throw;
            }
        }

        private async Task<WorkoutPlan> CreatePlanForNewWorkoutAsync(Guid workoutPublicId, int userId)
        {
            Workout? workout = await _workoutService.GetByPublicIDAsync(workoutPublicId);
            var userSettings = await GetUserSettingsAsync(userId);

            var plan = new WorkoutPlan(workout, false);

            if (userSettings != null && userSettings.RecommendationsEnabled)
            {
                foreach (var exercisePlan in plan.Exercises)
                {
                    var exercise = workout.Exercises.First(x => x.ExerciseId == exercisePlan.ExerciseId);
                    var recommendation = await _recommendationService.GetRecommendationAsync(exercise.Exercise, null, userSettings);
                    exercisePlan.ApplyRecommendation(recommendation);
                }
            }

            return plan;
        }

        private async Task<WorkoutPlan> CreatePlanForExecutedWorkoutAsync(ExecutedWorkout lastExecutedWorkout)
        {
            var workoutPlan = new WorkoutPlan(lastExecutedWorkout.Workout, true);
            var exercisesInWorkout = lastExecutedWorkout.Workout.Exercises.ToList();
            var userSettings = await GetUserSettingsAsync(lastExecutedWorkout.Workout.CreatedByUserId);

            for (short x = 0; x < exercisesInWorkout.Count; x++)
            {
                var exerciseInWorkout = exercisesInWorkout[x];
                var exercisePlan = workoutPlan.Exercises.First(x => x.Sequence == exerciseInWorkout.Sequence);
                var exercisesFromLastTime = lastExecutedWorkout.Exercises.Where(x => x.ExerciseId == exerciseInWorkout.ExerciseId);

                exercisePlan.SetLastTimeValues(exercisesFromLastTime);

                if (userSettings != null && userSettings.RecommendationsEnabled)
                {
                    var recommendation = await _recommendationService.GetRecommendationAsync(exerciseInWorkout.Exercise, lastExecutedWorkout, userSettings);
                    exercisePlan.ApplyRecommendation(recommendation);
                }
            }

            return workoutPlan;
        }

        private async Task<UserSettings> GetUserSettingsAsync(int userId)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                throw new ApplicationException($"User {userId} not found.");
            else
                return user.Settings;
        }
    }
}
