using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.API.Models
{
    public record ExerciseInWorkoutDTO
    {
        public int Id { get; }
        public int ExerciseId { get; }
        public string ExerciseName { get; }
        public short NumberOfSets { get; }
        public SetType SetType { get; }
        public ResistanceType ResistanceType { get; }

        public ExerciseInWorkoutDTO(ExerciseInWorkout exercise)
        {
            Id = exercise.Id;
            ExerciseId = exercise.Exercise.Id;
            ExerciseName = exercise.Exercise.Name;
            NumberOfSets = exercise.NumberOfSets;
            SetType = exercise.SetType;
            ResistanceType = exercise.Exercise.ResistanceType;
        }
    }
}
