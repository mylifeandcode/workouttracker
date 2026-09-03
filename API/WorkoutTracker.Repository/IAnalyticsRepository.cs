using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace WorkoutTracker.Repository
{
    public interface IAnalyticsRepository
    {
        Task<List<TargetAreaWorkoutCount>> GetWorkoutCountsByTargetAreaAsync(int userId, CancellationToken cancellationToken = default);
    }
}
