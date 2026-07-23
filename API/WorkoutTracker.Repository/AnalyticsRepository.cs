using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Data;

namespace WorkoutTracker.Repository
{
    public class AnalyticsRepository : IAnalyticsRepository
    {
        private readonly WorkoutsContext _context;

        public AnalyticsRepository(WorkoutsContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<List<TargetAreaWorkoutCount>> GetWorkoutCountsByTargetAreaAsync(int userId)
        {
            return await _context.Database.SqlQueryRaw<TargetAreaWorkoutCount>($"""
                select ta.Name as {nameof(TargetAreaWorkoutCount.Name)},
                       count(distinct(ew.Id)) as {nameof(TargetAreaWorkoutCount.ExecutedWorkoutCount)}
                from TargetAreas ta
                join ExerciseTargetAreaLinks etal on ta.Id = etal.TargetAreaId
                join Exercises ex on ex.Id = etal.ExerciseId
                join ExecutedExercises exex on exex.ExerciseId = ex.Id
                join ExecutedWorkouts ew on ew.Id = exex.ExecutedWorkoutId
                where ew.CreatedByUserId = @userId and ew.EndDateTime is not null
                group by ta.Name
                """, new Microsoft.Data.SqlClient.SqlParameter("@userId", userId)).ToListAsync();
        }
    }
}
