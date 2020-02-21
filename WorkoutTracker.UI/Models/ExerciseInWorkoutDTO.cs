using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutTracker.UI.Models
{
    public class ExerciseInWorkoutDTO
    {
        public int Id { get; set; }
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; }
        public short NumberOfSets { get; set; }
        public SetType SetType { get; set; }

        public ExerciseInWorkoutDTO(ExerciseInWorkout exercise)
        {
            Id = exercise.Id;
            ExerciseId = exercise.Exercise.Id;
            ExerciseName = exercise.Exercise.Name;
            NumberOfSets = exercise.NumberOfSets;
            SetType = exercise.SetType;
        }
    }
}
