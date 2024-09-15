using System;
using WorkoutTracker.Application.Workouts.Models;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IWorkoutPlanService
    {
        WorkoutPlan Create(Guid workoutPublicId, int userId);
    }
}
