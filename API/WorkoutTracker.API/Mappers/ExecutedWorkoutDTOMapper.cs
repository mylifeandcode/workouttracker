using System;
using System.Linq;
using WorkoutTracker.API.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.API.Mappers
{
    public class ExecutedWorkoutDTOMapper : IExecutedWorkoutDTOMapper
    {
        //TODO: Use AutoMapper. Or don't. I've had some not-so-fun times with it.

        public ExecutedWorkoutDTO MapFromExecutedWorkout(ExecutedWorkout executedWorkout)
        {
            if(executedWorkout == null) throw new ArgumentNullException(nameof(executedWorkout));

            return new ExecutedWorkoutDTO(
                executedWorkout.PublicId,
                executedWorkout.CreatedDateTime,
                executedWorkout.ModifiedDateTime,
                executedWorkout.Workout.Name,
                executedWorkout.Workout.PublicId,
                executedWorkout.StartDateTime,
                executedWorkout.EndDateTime,
                executedWorkout.Journal,
                executedWorkout.Rating,
                executedWorkout.Exercises?.Select(executedExercise => 
                    new ExecutedExerciseDTO(
                        executedExercise.Id,
                        executedExercise.CreatedDateTime,
                        executedExercise.ModifiedDateTime,
                        executedExercise.Exercise.Name, 
                        executedExercise.Exercise.PublicId,
                        executedExercise.Exercise.ResistanceType, 
                        executedExercise.Sequence, 
                        executedExercise.TargetRepCount, 
                        executedExercise.ActualRepCount, 
                        executedExercise.Notes, 
                        executedExercise.ResistanceAmount, 
                        executedExercise.ResistanceMakeup, 
                        executedExercise.SetType, 
                        executedExercise.Duration, 
                        executedExercise.FormRating, 
                        executedExercise.RangeOfMotionRating, 
                        executedExercise.Exercise.BandsEndToEnd, 
                        executedExercise.Exercise.InvolvesReps, 
                        executedExercise.Side, 
                        executedExercise.Exercise.UsesBilateralResistance)
                    )
            );
        }

        public ExecutedWorkout MapToExecutedWorkout(ExecutedWorkoutDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);
            return new ExecutedWorkout();
        }
    }
}
