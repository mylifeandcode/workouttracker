using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.Interfaces;

namespace WorkoutTracker.Domain.BaseClasses
{
    public abstract class Entity : IEntity
    {
        public int Id { get; set; }
        public int CreatedByUserId { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public int? ModifiedByUserId { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
    }
}
