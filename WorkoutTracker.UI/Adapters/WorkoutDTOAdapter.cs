using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.UI.Adapters
{
    public class WorkoutDTOAdapter : IWorkoutDTOAdapter
    {
        public WorkoutDTO AdaptFromWorkout(Workout workout)
        {
            if (workout == null) throw new ArgumentNullException(nameof(workout));

            return new WorkoutDTO(
                workout.Id,
                workout.Name,
                workout.Exercises?.Select(exercise => new ExerciseInWorkoutDTO(exercise)),
                string.Join(", ",
                     workout.Exercises?.SelectMany(x =>
                        x.Exercise?.ExerciseTargetAreaLinks?.Select(x => x.TargetArea.Name))
                    .OrderBy(x => x)
                    .Distinct()),
                workout.Active);
        }
    }
}
