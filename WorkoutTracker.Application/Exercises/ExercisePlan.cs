using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Domain.Exercises;
using WorkoutTracker.Application.Exercises;

namespace WorkoutApplication.Application.Exercises
{
    /// <summary>
    /// A class used to plan targets (reps and resistance) for an exercise prior to a workout.
    /// This class is not persisted, but rather used to gather information from the user and then 
    /// create the ExecutedWorkout instance.
    /// </summary>
    public class ExercisePlan
    {
        public int ExerciseInWorkoutId { get; set; }
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; }
        public byte NumberOfSets { get; set; }
        public SetType SetType { get; set; }
        public byte Sequence { get; set; }

        public byte TargetRepCountLastTime { get; set; }
        public byte MaxActualRepCountLastTime { get; set; }
        public byte? RecommendedTargetRepCount { get; set; }
        public byte TargetRepCount { get; set; }

        public decimal ResistanceAmountLastTime { get; set; }
        public string ResistanceMakeupLastTime { get; set; }
        public decimal? RecommendedResistanceAmount { get; set; }
        public string RecommendedResistanceMakeup { get; set; }
        public decimal ResistanceAmount { get; set; }
        public string ResistanceMakeup { get; set; }

        public string RecommendationReason { get; set; }

        public ExercisePlan(ExerciseInWorkout exercise)
        {
            ExerciseInWorkoutId = exercise.Id;
            ExerciseId = exercise.Exercise.Id;
            ExerciseName = exercise.Exercise.Name;
            NumberOfSets = exercise.NumberOfSets;
            SetType = exercise.SetType;
            Sequence = exercise.Sequence;
        }

        public void SetLastTimeValues(IEnumerable<ExecutedExercise> executedExercises)
        {
            TargetRepCountLastTime = executedExercises.Max(x => x.TargetRepCount);
            MaxActualRepCountLastTime = executedExercises.Max(x => x.ActualRepCount);

            var executedWithMaxResitance = 
                executedExercises.OrderByDescending(x => x.ResistanceAmount).First();

            ResistanceAmountLastTime = executedWithMaxResitance.ResistanceAmount;
            ResistanceMakeupLastTime = executedWithMaxResitance.ResistanceMakeup;
        }

        public void ApplyRecommendation(ExerciseAmountRecommendation recommendation)
        {
            if (recommendation != null)
            {
                RecommendationReason = recommendation.Reason;
                RecommendedResistanceAmount = recommendation.ResistanceAmount;
                RecommendedResistanceMakeup = recommendation.ResistanceMakeup;
                RecommendedTargetRepCount = recommendation.Reps;
            }
        }
    }
}
