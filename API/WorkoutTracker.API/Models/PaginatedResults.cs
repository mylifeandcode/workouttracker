using System.Collections.Generic;

namespace WorkoutTracker.API.Models
{
    public record PaginatedResults<T>(IEnumerable<T> Results, int TotalCount);
}
