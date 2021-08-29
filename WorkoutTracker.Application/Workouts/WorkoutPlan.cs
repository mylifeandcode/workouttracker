using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Application.Exercises;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Workouts;

namespace WorkoutApplication.Application.Workouts
{
    /// <summary>
    /// A class for use in planning a workout's targets (reps and resistance) before executing.
    /// This class is not persisted, but rather used to gather information from the user and then 
    /// create the ExecutedWorkout instance.
    /// </summary>
    public class WorkoutPlan
    {
        public int WorkoutId { get; set; }
        public string WorkoutName { get; set; }
        public bool HasBeenExecutedBefore { get; set; }
        public List<ExercisePlan> Exercises { get; set; }

        public WorkoutPlan() { }

        public WorkoutPlan(Workout workout, bool hasBeenExecutedBefore)
        {
            if (workout == null)
                throw new ArgumentNullException(nameof(workout));

            WorkoutId = workout.Id;
            WorkoutName = workout.Name;
            HasBeenExecutedBefore = hasBeenExecutedBefore;
            SetupExercises(workout.Exercises);
        }

        private void SetupExercises(ICollection<ExerciseInWorkout> exercisesInWorkout)
        {
            Exercises = new List<ExercisePlan>(exercisesInWorkout.Count);
            foreach (var exercise in exercisesInWorkout)
            {
                Exercises.Add(new ExercisePlan(exercise));
            }
        }
    }
}
