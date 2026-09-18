using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Mappers
{
    public interface IExerciseDTOMapper
    {
        ExerciseDetailDTO MapToDetailDTO(Exercise exercise);
    }
}
