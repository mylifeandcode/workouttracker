using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.UI.Models
{
    public record PaginatedResults<T>
    {
        public IEnumerable<T> Results { get; }
        public int TotalCount { get; }

        public PaginatedResults(IEnumerable<T> results, int totalCount) 
            => (Results, TotalCount) = (results, totalCount);
    }
}
