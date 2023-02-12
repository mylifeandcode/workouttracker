using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Models
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
        public byte NumberOfSets { get; set; } //TODO: Evaluate. I think this can be removed.
        public SetType SetType { get; set; }
        public ResistanceType ResistanceType { get; set; }
        public byte Sequence { get; set; }

        public byte TargetRepCountLastTime { get; set; }
        public byte MaxActualRepCountLastTime { get; set; }
        public double AvgActualRepCountLastTime { get; set; }

        public byte MaxRangeOfMotionLastTime { get; set; }
        public double AvgRangeOfMotionLastTime { get; set; }

        public byte MaxFormLastTime { get; set; }
        public double AvgFormLastTime { get; set; }

        public byte? RecommendedTargetRepCount { get; set; }
        public byte TargetRepCount { get; set; }

        public decimal ResistanceAmountLastTime { get; set; }
        public string ResistanceMakeupLastTime { get; set; }
        public decimal? RecommendedResistanceAmount { get; set; }
        public string RecommendedResistanceMakeup { get; set; }
        public decimal ResistanceAmount { get; set; }
        public string ResistanceMakeup { get; set; }
        public bool? BandsEndToEnd { get; set; }
        public bool InvolvesReps { get; set; }

        public string RecommendationReason { get; set; }

        public ExercisePlan() { }

        public ExercisePlan(ExerciseInWorkout exercise)
        {
            if (exercise == null)
                throw new ArgumentNullException(nameof(exercise));
            
            ExerciseInWorkoutId = exercise.Id;
            ExerciseId = exercise.Exercise.Id;
            ExerciseName = exercise.Exercise.Name;
            NumberOfSets = exercise.NumberOfSets; //TODO: Evaluate. I think this can be removed.
            SetType = exercise.SetType;
            ResistanceType = exercise.Exercise.ResistanceType;
            BandsEndToEnd = exercise.Exercise.BandsEndToEnd;
            InvolvesReps = exercise.Exercise.InvolvesReps;
            Sequence = exercise.Sequence;
        }

        public void SetLastTimeValues(IEnumerable<ExecutedExercise> executedExercises)
        {
            if (executedExercises == null || !executedExercises.Any())
                return;

            TargetRepCountLastTime = executedExercises.Max(x => x.TargetRepCount);
            MaxActualRepCountLastTime = executedExercises.Max(x => x.ActualRepCount);
            AvgActualRepCountLastTime = Math.Round(executedExercises.Average(x => x.ActualRepCount), 2);

            MaxRangeOfMotionLastTime = executedExercises.Max(x => x.RangeOfMotionRating);
            AvgRangeOfMotionLastTime = Math.Round(executedExercises.Average(x => x.RangeOfMotionRating), 2);

            MaxFormLastTime = executedExercises.Max(x => x.FormRating);
            AvgFormLastTime = Math.Round(executedExercises.Average(x => x.FormRating), 2);

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
