using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Domain.BaseClasses
{
    public abstract class Entity
    {
        public int Id { get; set; }
        public int CreatedByUserId { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public int? ModifiedByUserId { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
    }
}
