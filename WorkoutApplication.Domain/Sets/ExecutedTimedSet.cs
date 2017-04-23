using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutApplication.Domain.Sets
{
    public class ExecutedTimedSet : ExecutedSet
    {
        public TimeSpan ExecutedTime { get; set; }
    }
}
