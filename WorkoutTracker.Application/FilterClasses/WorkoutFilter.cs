using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Application.FilterClasses
{
    public class WorkoutFilter
    {
        public string NameContains { get; set; }
        public int UserId { get; set; }
    }
}
