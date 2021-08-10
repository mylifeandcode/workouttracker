using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Workouts;
using WorkoutTracker.Application.Exercises;

namespace WorkoutTracker.Application.Workouts
{
    public class WorkoutPlanService : IWorkoutPlanService
    {
        private IWorkoutService _workoutService;
        private IExecutedWorkoutService _executedWorkoutService;
        private IExerciseAmountRecommendationService _recommendationService;

        public WorkoutPlanService(
            IWorkoutService workoutService,
            IExecutedWorkoutService executedWorkoutService,
            IExerciseAmountRecommendationService recommendationService)
        {
            _workoutService = workoutService ?? throw new ArgumentNullException(nameof(workoutService));
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _recommendationService = recommendationService ?? throw new ArgumentNullException(nameof(recommendationService));
        }

        public WorkoutPlan Create(int workoutId)
        {
            try
            {
                ExecutedWorkout lastExecutedWorkout = _executedWorkoutService.GetLatest(workoutId);

                if (lastExecutedWorkout == null)
                    return CreatePlanForNewWorkout(workoutId);
                else
                    return CreatePlanForExecutedWorkout(lastExecutedWorkout);
            }
            catch (Exception ex)
            {
                //TODO: Log
                throw;
            }
        }

        private WorkoutPlan CreatePlanForNewWorkout(int workoutId)
        {
            Workout workout = _workoutService.GetById(workoutId);
            return new WorkoutPlan(workout, false);
        }

        private WorkoutPlan CreatePlanForExecutedWorkout(ExecutedWorkout lastExecutedWorkout)
        {
            var output = new WorkoutPlan(lastExecutedWorkout.Workout, true);
            var recommendationsEnabled = RecommendationsAreEnabled();
            var exercisesInWorkout = lastExecutedWorkout.Workout.Exercises.ToList();

            for (short x = 0; x < exercisesInWorkout.Count; x++)
            {
                var exerciseInWorkout = exercisesInWorkout[x];
                var exercisePlan = new ExercisePlan(exerciseInWorkout);
                var executedExercises =
                    lastExecutedWorkout
                        .Exercises
                        .Where(x => x.ExerciseId == exerciseInWorkout.ExerciseId);
                if (recommendationsEnabled)
                {
                    var recommendation = _recommendationService.GetRecommendation(exerciseInWorkout.Exercise, lastExecutedWorkout, null);
                    exercisePlan.RecommendationReason = recommendation.Reason;
                    exercisePlan.RecommendedResistanceAmount = recommendation.ResistanceAmount;
                    exercisePlan.RecommendedResistanceMakeup = recommendation.ResistanceMakeup;
                    exercisePlan.RecommendedTargetRepCount = recommendation.Reps;
                }
                output.Exercises.Add(exercisePlan);
            }

            return output;
        }

        private bool RecommendationsAreEnabled()
        {
            //TODO: Implement
            return false;
        }
    }
}
