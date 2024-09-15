using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Application.Exercises.Models;

namespace WorkoutTracker.Application.Workouts.Models
{
    /// <summary>
    /// A class for use in planning a workout's targets (reps and resistance) before executing.
    /// This class is not persisted, but rather used to gather information from the user and then 
    /// create the ExecutedWorkout instance.
    /// </summary>
    public class WorkoutPlan
    {
        public int WorkoutId { get; set; }
        public Guid WorkoutPublicId { get; set; }
        public string WorkoutName { get; set; }
        public int UserId { get; set; }
        public bool HasBeenExecutedBefore { get; set; }
        public List<ExercisePlan> Exercises { get; set; }
        public DateTime? SubmittedDateTime { get; set; }

        public WorkoutPlan() { }

        public WorkoutPlan(Workout workout, bool hasBeenExecutedBefore)
        {
            if (workout == null)
                throw new ArgumentNullException(nameof(workout));

            WorkoutId = workout.Id;
            WorkoutPublicId = workout.PublicId;
            WorkoutName = workout.Name;
            HasBeenExecutedBefore = hasBeenExecutedBefore;
            UserId = workout.CreatedByUserId;
            SetupExercises(workout.Exercises);
        }

        private void SetupExercises(ICollection<ExerciseInWorkout> exercisesInWorkout)
        {
            Exercises = new List<ExercisePlan>(exercisesInWorkout.Count);
            foreach (var exercise in exercisesInWorkout.OrderBy(x => x.Sequence))
            {
                Exercises.Add(new ExercisePlan(exercise));
            }
        }
    }
}
