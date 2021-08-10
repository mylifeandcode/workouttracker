using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts
{
    public interface IWorkoutPlanService
    {
        WorkoutPlan Create(int workoutId);
    }
}
