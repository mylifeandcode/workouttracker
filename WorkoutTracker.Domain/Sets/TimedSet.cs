using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Domain.Sets
{
    public class TimedSet : Set
    {
        public TimeSpan TargetTime { get; set; }
    }
}
