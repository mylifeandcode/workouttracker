using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Application.Workouts.Models;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IAnalyticsService
    {
        ExecutedWorkoutsSummary GetExecutedWorkoutsSummary(int userId);
        List<ExecutedWorkoutMetrics> GetExecutedWorkoutMetrics(int workoutId, int count = 5);
    }
}
