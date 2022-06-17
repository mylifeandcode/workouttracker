using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts.Models
{
    public class ExecutedWorkoutMetrics
    {
        public string Name { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public List<ExecutedExerciseMetrics> ExerciseMetrics { get; set; } = new List<ExecutedExerciseMetrics>();

        public ExecutedWorkoutMetrics(ExecutedWorkout executedWorkout)
        {
            if (executedWorkout != null)
            {
                Name = executedWorkout.Workout.Name;
                StartDateTime = executedWorkout.StartDateTime.Value;
                EndDateTime = executedWorkout.EndDateTime.Value;
                SetExecutedExerciseMetrics(executedWorkout.Exercises);
            }
        }

        private void SetExecutedExerciseMetrics(ICollection<ExecutedExercise> exercises)
        {
            var groupedExercises = exercises.GroupBy(x => x.Exercise.Id);
            ExerciseMetrics = new List<ExecutedExerciseMetrics>(groupedExercises.Count());
            foreach (var exerciseGroup in groupedExercises)
            {
                ExerciseMetrics.Add(new ExecutedExerciseMetrics(exerciseGroup.ToList()));
            }
        }
    }
}
