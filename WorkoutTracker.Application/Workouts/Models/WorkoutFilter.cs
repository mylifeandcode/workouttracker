using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Application.Workouts.Models
{
    public class WorkoutFilter
    {
        public int UserId { get; set; }
        public string NameContains { get; set; }
        public bool ActiveOnly { get; set; }
    }
}
