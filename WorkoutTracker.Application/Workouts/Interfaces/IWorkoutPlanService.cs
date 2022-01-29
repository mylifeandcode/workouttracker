using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IWorkoutPlanService
    {
        WorkoutPlan Create(int workoutId, int userId);
    }
}
