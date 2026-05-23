using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Application.Shared.BaseClasses;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Workouts.Services
{
    public class ExecutedWorkoutService : PublicEntityServiceBase<ExecutedWorkout>, IExecutedWorkoutService
    {
        private IRepository<Workout> _workoutRepo;

        public ExecutedWorkoutService(
            IRepository<ExecutedWorkout> executedWorkoutRepo,
            IRepository<Workout> workoutRepo,
            ILogger<ExecutedWorkoutService> logger) : base(executedWorkoutRepo, logger)
        {
            _workoutRepo = workoutRepo ?? throw new ArgumentNullException(nameof(workoutRepo));
        }

        public async Task<ExecutedWorkout> CreateAsync(WorkoutPlan plan, bool startWorkout)
        {
            if (plan == null)
                throw new ArgumentNullException(nameof(plan));

            if (startWorkout)
                return await CreateFromPlanAsync(plan, plan.SubmittedDateTime, null);
            else
                return await CreateFromPlanAsync(plan, null, null);
        }

        public async Task<ExecutedWorkout> CreateAsync(WorkoutPlan plan, DateTime startDateTime, DateTime endDateTime)
        {
            if (plan == null)
                throw new ArgumentNullException(nameof(plan));

            return await CreateFromPlanAsync(plan, startDateTime, endDateTime);
        }

        public override async Task<ExecutedWorkout> AddAsync(ExecutedWorkout entity, bool saveChanges = false)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            /*
            When attempting to save an ExecutedWorkout, the following exception would
            occur:

            "The instance of entity type 'TargetArea' cannot be tracked because
            another instance with the same key value for {'Id'} is already being
            tracked. When attaching existing entities, ensure that only one entity
            instance with a given key value is attached. Consider using
            'DbContextOptionsBuilder.EnableSensitiveDataLogging' to see the
            conflicting key values."

            This is because ExecutedExercise has a reference to an Exercise, which
            in turn has a collection of ExerciseTargetAreaLinks, which in turn relate
            to TargetAreas. One solution to the problem would be to set the state
            of the Exercise objects to EntityState.Unchanged, but this requires a
            reference to the DbContext. I'm going with the simpler (albeit less
            elegant) approach here, which is to set the Exercises to null. The
            reference will still be preserved via the ExerciseId property.
            */
            foreach (var executedExercise in entity.Exercises)
            {
                executedExercise.Exercise = null;
            }
            return await base.AddAsync(entity, saveChanges);
        }

        public override async Task<ExecutedWorkout> UpdateAsync(ExecutedWorkout entity, bool saveChanges = false)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repo.UpdateAsync(entity, (executedWorkout) => executedWorkout.Exercises);

            return entity;
        }

        public async Task<IEnumerable<ExecutedWorkout>> GetFilteredSubsetAsync(int firstRecordIndex, short subsetSize, ExecutedWorkoutFilter filter, bool newestFirst)
        {
            IQueryable<ExecutedWorkout> query = _repo.GetWithoutTracking();

            if (filter != null)
                ApplyQueryFilters(ref query, filter);

            if (newestFirst)
                query = query.OrderByDescending(x => x.StartDateTime);
            else
                query = query.OrderBy(x => x.StartDateTime);

            return await query.Skip(firstRecordIndex).Take(subsetSize).ToListAsync();
        }

        public async Task<IEnumerable<ExecutedWorkout>> GetRecentByWorkoutAsync(int workoutId, int count)
        {
            return await _repo.GetWithoutTracking()
                .Where(x => x.WorkoutId == workoutId && x.EndDateTime.HasValue)
                .OrderByDescending(x => x.EndDateTime)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExecutedWorkout>> GetRecentAsync(int numberOfMostRecent)
        {
            return await _repo.GetWithoutTracking()
                .Where(workout => workout.StartDateTime.HasValue)
                .OrderByDescending(workout => workout.StartDateTime!.Value)
                .Take(numberOfMostRecent)
                .ToListAsync();
        }

        public async Task<ExecutedWorkout?> GetLatestAsync(Guid workoutPublicId)
        {
            return await _repo.GetWithoutTracking()
                .Where(x => x.StartDateTime.HasValue && x.EndDateTime.HasValue)
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync(x => x.Workout.PublicId == workoutPublicId);
        }

        public async Task<int> GetTotalCountAsync(ExecutedWorkoutFilter filter)
        {
            var query = _repo.GetWithoutTracking();
            ApplyQueryFilters(ref query, filter);
            return await query.CountAsync();
        }

        public async Task<int> GetPlannedCountAsync(int userId)
        {
            return await _repo.GetWithoutTracking()
                .Where(x => x.CreatedByUserId == userId
                    && !x.StartDateTime.HasValue
                    && !x.EndDateTime.HasValue)
                .CountAsync();
        }

        public async Task<IEnumerable<ExecutedWorkout>> GetByUserAsync(int userId)
        {
            return await _repo.GetWithoutTracking()
                .Where(x => x.CreatedByUserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExecutedWorkout>> GetInProgressAsync(int userId)
        {
            return await _repo.GetWithoutTracking()
                .Where(x => x.CreatedByUserId == userId
                    && x.StartDateTime.HasValue
                    && !x.EndDateTime.HasValue)
                .OrderByDescending(x => x.StartDateTime)
                .ToListAsync();
        }

        public async Task DeletePlannedAsync(Guid publicId)
        {
            var executedWorkout = await _repo.Get().FirstOrDefaultAsync(x => x.PublicId == publicId);

            if (executedWorkout == null)
                throw new ArgumentException($"Executed workout {publicId} not found.");

            if (executedWorkout.StartDateTime.HasValue)
                throw new ArgumentException($"Executed workout {publicId} has already been started.");

            await _repo.DeleteAsync(executedWorkout.Id);
        }

        #region Private Methods

        private async Task<ExecutedWorkout> CreateFromPlanAsync(WorkoutPlan workoutPlan, DateTime? startDateTime, DateTime? endDateTime)
        {
            var executedWorkout = new ExecutedWorkout();
            var workout = await _workoutRepo.GetWithoutTracking().FirstAsync(x => x.PublicId == workoutPlan.WorkoutId);
            executedWorkout.WorkoutId = workout.Id;
            executedWorkout.CreatedByUserId = workout.CreatedByUserId;
            executedWorkout.Exercises = new List<ExecutedExercise>();

            byte exerciseSequence = 0;
            foreach (var exerciseInWorkout in workout.Exercises?.OrderBy(x => x.Sequence))
            {
                var exercisePlan = workoutPlan.Exercises.First(exPlan => exPlan.ExerciseId == exerciseInWorkout.ExerciseId);

                for (byte x = 0; x < exerciseInWorkout.NumberOfSets; x++)
                {
                    var exerciseToExecute = new ExecutedExercise();
                    exerciseToExecute.CreatedByUserId = workout.CreatedByUserId;
                    exerciseToExecute.CreatedDateTime = workoutPlan.SubmittedDateTime.Value;
                    exerciseToExecute.ExerciseId = exerciseInWorkout.Exercise.Id;
                    exerciseToExecute.Sequence = exerciseSequence;
                    exerciseToExecute.SetType = exerciseInWorkout.SetType;

                    exerciseToExecute.TargetRepCount = exercisePlan.TargetRepCount;
                    exerciseToExecute.ResistanceAmount = exercisePlan.ResistanceAmount;
                    exerciseToExecute.ResistanceMakeup = exercisePlan.ResistanceMakeup;

                    if (exerciseInWorkout.Exercise.OneSided) exerciseToExecute.Side = ExerciseSide.Right;

                    executedWorkout.Exercises.Add(exerciseToExecute);
                    exerciseSequence++;

                    if (exerciseInWorkout.Exercise.OneSided)
                    {
                        var anotherExerciseToExecute = exerciseToExecute.Clone();
                        anotherExerciseToExecute.Side = ExerciseSide.Left;
                        anotherExerciseToExecute.Sequence = exerciseSequence;
                        executedWorkout.Exercises.Add(anotherExerciseToExecute);
                        exerciseSequence++;
                    }
                }
            }

            executedWorkout.StartDateTime = startDateTime;
            executedWorkout.EndDateTime = endDateTime;

            await AddAsync(executedWorkout, true);

            return executedWorkout;
        }

        private void ApplyQueryFilters(ref IQueryable<ExecutedWorkout> query, ExecutedWorkoutFilter filter)
        {
            if (filter == null)
                return;

            query = query.Where(x => x.CreatedByUserId == filter.UserId);

            if (filter.PlannedOnly)
            {
                query = query.Where(x => x.StartDateTime == null && x.EndDateTime == null);
            }
            else
            {
                if (filter.StartDateTime.HasValue)
                    query = query.Where(x => x.StartDateTime >= filter.StartDateTime);
                else
                    query = query.Where(x => x.StartDateTime != null);

                if (filter.EndDateTime.HasValue)
                    query = query.Where(x => x.EndDateTime <= filter.EndDateTime);
                else
                    query = query.Where(x => x.EndDateTime != null);
            }

            if (filter.WorkoutNameContains != null)
            {
                query = query.Where(x => EF.Functions.Like(x.Workout.Name,
                    $"%{filter.WorkoutNameContains}%"));
            }

            if (filter.OnlyWithJournalNotes)
            {
                query = query.Where(x => !string.IsNullOrEmpty(x.Journal));
            }
        }

        #endregion Private Methods
    }
}
