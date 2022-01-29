using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Domain.Sets
{
    public class ExecutedTimedSet : ExecutedSet
    {
        public TimeSpan ExecutedTime { get; set; }
    }
}
