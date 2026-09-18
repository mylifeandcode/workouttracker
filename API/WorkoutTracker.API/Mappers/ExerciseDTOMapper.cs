using System;
using System.Linq;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Mappers
{
    public class ExerciseDTOMapper : IExerciseDTOMapper
    {
        public ExerciseDetailDTO MapToDetailDTO(Exercise exercise)
        {
            if (exercise == null) throw new ArgumentNullException(nameof(exercise));

            return new ExerciseDetailDTO(
                exercise.Id,
                exercise.PublicId,
                exercise.CreatedByUserId,
                exercise.CreatedDateTime,
                exercise.Name,
                exercise.Description,
                exercise.Setup,
                exercise.Movement,
                exercise.PointsToRemember,
                exercise.ResistanceType,
                exercise.OneSided,
                exercise.BandsEndToEnd,
                exercise.InvolvesReps,
                exercise.UsesBilateralResistance,
                exercise.ExerciseTargetAreaLinks.Select(link => link.TargetAreaId).ToList());
        }
    }
}
