using System;
using System.Collections.Generic;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Interfaces;

namespace WorkoutTracker.API.Models
{
    public class ExecutedWorkoutDTO : NamedEntity, IPublicEntity
    {
        public int WorkoutId { get; set; }
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public string Journal { get; set; }
        public int Rating { get; set; }
        public IEnumerable<ExecutedExerciseDTO> Exercises { get; set; }
        public Guid PublicId { get; set; }

        public ExecutedWorkoutDTO(
            int id,
            Guid publicId,
            string name,
            int workoutId,
            DateTime? startDateTime,
            DateTime? endDateTime,
            string journal,
            int rating,
            IEnumerable<ExecutedExerciseDTO> exercises,
            int createdByUserId, 
            DateTime createdDateTime, 
            int? modifiedByUserId, 
            DateTime? modifiedDateTime)
        {
            Id = id;
            PublicId = publicId;
            Name = name;
            WorkoutId = workoutId;
            StartDateTime = startDateTime;
            EndDateTime = endDateTime;
            Journal = journal;
            Rating = rating;
            Exercises = exercises;
            CreatedByUserId = createdByUserId;
            CreatedDateTime = createdDateTime;
            ModifiedByUserId = modifiedByUserId;
            ModifiedDateTime = modifiedDateTime;
        }
    }
}
