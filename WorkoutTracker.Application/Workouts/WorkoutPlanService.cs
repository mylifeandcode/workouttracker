﻿using System;
using System.Linq;
using WorkoutApplication.Application.Workouts;
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
            var workoutPlan = new WorkoutPlan(lastExecutedWorkout.Workout, true);
            var exercisesInWorkout = lastExecutedWorkout.Workout.Exercises.ToList();
            var userSettings = GetUserSettings(lastExecutedWorkout.Workout.CreatedByUserId);

            for (short x = 0; x < exercisesInWorkout.Count; x++)
            {
                var exerciseInWorkout = exercisesInWorkout[x];

                //Find the ExercisePlan object from our new WorkoutPlan object for this exercise
                var exercisePlan = workoutPlan.Exercises.First(x => x.Sequence == exerciseInWorkout.Sequence);
                
                //Get the ExecutedExercises for this exercise from the last time this workout 
                //was performed
                var exercisesFromLastTime =
                    lastExecutedWorkout
                        .Exercises
                        .Where(x => x.ExerciseId == exerciseInWorkout.ExerciseId);

                exercisePlan.SetLastTimeValues(exercisesFromLastTime);

                //If recommendations are enabled, apply them
                if (userSettings != null && userSettings.RecommendationsEnabled)
                {
                    var recommendation = 
                        _recommendationService.GetRecommendation(
                            exerciseInWorkout.Exercise, lastExecutedWorkout, userSettings);

                    exercisePlan.ApplyRecommendation(recommendation);
                }
            }

            return workoutPlan;
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
