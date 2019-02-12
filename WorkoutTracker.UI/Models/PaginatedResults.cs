using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.UI.Models
{
    public class PaginatedResults<T>
    {
        public IEnumerable<T> Results { get; set; }
        public int TotalCount { get; set; }
    }
}
