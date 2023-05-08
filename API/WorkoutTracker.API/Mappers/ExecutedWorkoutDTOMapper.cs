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
                executedWorkout.Id,
                executedWorkout.Workout.Name,
                executedWorkout.WorkoutId,
                executedWorkout.StartDateTime,
                executedWorkout.EndDateTime,
                executedWorkout.Journal,
                executedWorkout.Rating,
                executedWorkout.Exercises?.Select(executedExercise => 
                    new ExecutedExerciseDTO(
                        executedExercise.Id, 
                        executedExercise.Exercise.Name, 
                        executedExercise.Exercise.Id, 
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
                        executedExercise.CreatedByUserId, 
                        executedExercise.CreatedDateTime, 
                        executedExercise.ModifiedByUserId, 
                        executedExercise.ModifiedDateTime,
                        executedExercise.Side)
                    ),
                executedWorkout.CreatedByUserId, 
                executedWorkout.CreatedDateTime, 
                executedWorkout.ModifiedByUserId, 
                executedWorkout.ModifiedDateTime
            );
        }
    }
}
