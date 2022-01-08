using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Application.FilterClasses
{
    public class WorkoutFilter
    {
        public int UserId { get; set; }
        public string NameContains { get; set; }
        public bool ActiveOnly { get; set; }
    }
}
