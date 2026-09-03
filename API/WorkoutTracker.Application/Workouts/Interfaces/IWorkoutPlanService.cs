using System;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Workouts.Models;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IWorkoutPlanService
    {
        Task<WorkoutPlan> CreateAsync(Guid workoutPublicId, int userId, CancellationToken cancellationToken = default);
    }
}
