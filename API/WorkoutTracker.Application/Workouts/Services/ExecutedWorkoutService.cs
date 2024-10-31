using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public ExecutedWorkout Create(WorkoutPlan plan, bool startWorkout)
        {
            if (plan == null)
                throw new ArgumentNullException(nameof(plan));

            if (startWorkout)
                return CreateFromPlan(plan, plan.SubmittedDateTime, null);
            else
                return CreateFromPlan(plan, null, null);
        }

        public ExecutedWorkout Create(WorkoutPlan plan, DateTime startDateTime, DateTime endDateTime)
        {
            if (plan == null)
                throw new ArgumentNullException(nameof(plan));

            return CreateFromPlan(plan, startDateTime, endDateTime);
        }

        public override ExecutedWorkout Add(ExecutedWorkout entity, bool saveChanges = false)
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
            //TODO: Use the approach in the Update() method instead!
            foreach (var executedExercise in entity.Exercises)
            {
                executedExercise.Exercise = null;
            }
            return base.Add(entity, saveChanges);
        }

        public override ExecutedWorkout Update(ExecutedWorkout entity, bool saveChanges = false)
        {
            //TODO: Refactor to make async
            //TODO: Refactor method signature to remove saveChanges param

            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            _repo.UpdateAsync(entity, (executedWorkout) => executedWorkout.Exercises).Wait();

            return entity;
        }

        public IEnumerable<ExecutedWorkout> GetFilteredSubset(int firstRecordIndex, short subsetSize, ExecutedWorkoutFilter filter, bool newestFirst)
        {
            IQueryable<ExecutedWorkout> query = _repo.GetWithoutTracking();

            if (filter != null)
                ApplyQueryFilters(ref query, filter);

            if (newestFirst)
                query = query.OrderByDescending(x => x.StartDateTime);
            else
                query = query.OrderBy(x => x.StartDateTime);

            var output = query.Skip(firstRecordIndex).Take(subsetSize);
            return output;
        }

        public IEnumerable<ExecutedWorkout> GetRecent(int numberOfMostRecent)
        {
            IQueryable<ExecutedWorkout> query = _repo.GetWithoutTracking();
            var output = query
                .Where(workout => workout.StartDateTime.HasValue)
                .OrderByDescending(workout => workout.StartDateTime.Value)
                //.Distinct(workout.Workout.Id) //TODO: Get last n number of distinct by Workout
                .Take(numberOfMostRecent);
            return output;
        }

        public ExecutedWorkout GetLatest(Guid workoutPublicId)
        {
            //No user ID needed here, as workouts are user-centric
            return _repo.GetWithoutTracking()
                .Where(x => x.StartDateTime.HasValue && x.EndDateTime.HasValue)
                .OrderByDescending(x => x.Id)
                .FirstOrDefault(x => x.Workout.PublicId == workoutPublicId);
        }

        public int GetTotalCount(ExecutedWorkoutFilter filter)
        {
            var query = _repo.GetWithoutTracking();
            ApplyQueryFilters(ref query, filter);
            return query.Count();
        }

        public int GetPlannedCount(int userId)
        {
            return 
                _repo.GetWithoutTracking()
                    .Where(x => x.CreatedByUserId == userId 
                        && !x.StartDateTime.HasValue 
                        && !x.EndDateTime.HasValue).Count();
        }

        public IEnumerable<ExecutedWorkout> GetInProgress(int userId)
        {
            return
                _repo.GetWithoutTracking()
                    .Where(x => x.CreatedByUserId == userId
                        && x.StartDateTime.HasValue
                        && !x.EndDateTime.HasValue)
                    .OrderByDescending(x => x.StartDateTime);
        }

        public void DeletePlanned(Guid publicId)
        {
            var executedWorkout = _repo.Get().FirstOrDefault(x => x.PublicId == publicId);

            if (executedWorkout == null)
                throw new ArgumentException($"Executed workout {publicId} not found.");

            if (executedWorkout.StartDateTime.HasValue)
                throw new ArgumentException($"Executed workout {publicId} has already been started.");

            _repo.Delete(executedWorkout.Id);
        }

        public ExecutedWorkout GetByPublicId(Guid publicId)
        {
            return base.GetByPublicID(publicId);
        }

        #region Private Methods

        private ExecutedWorkout CreateFromPlan(WorkoutPlan workoutPlan, DateTime? startDateTime, DateTime? endDateTime)
        {
            var executedWorkout = new ExecutedWorkout();
            var workout = _workoutRepo.GetWithoutTracking().First(x => x.PublicId == workoutPlan.WorkoutId);
            //executedWorkout.WorkoutId = workoutPlan.WorkoutId;
            executedWorkout.WorkoutId = workout.Id;
            executedWorkout.CreatedByUserId = workout.CreatedByUserId;
            executedWorkout.Exercises = new List<ExecutedExercise>(); //TODO: Initialize by known size

            byte exerciseSequence = 0;
            foreach (var exerciseInWorkout in workout.Exercises?.OrderBy(x => x.Sequence))
            {
                //Find the ExercisePlan in the submitted WorkoutPlan for this exercise
                var exercisePlan = workoutPlan.Exercises.First(exPlan => exPlan.ExerciseId == exerciseInWorkout.ExerciseId);

                for (byte x = 0; x < exerciseInWorkout.NumberOfSets; x++)
                {
                    var exerciseToExecute = new ExecutedExercise();
                    exerciseToExecute.CreatedByUserId = workout.CreatedByUserId;
                    exerciseToExecute.CreatedDateTime = workoutPlan.SubmittedDateTime.Value;
                    //exerciseToExecute.Exercise = exerciseInWorkout.Exercise; //NOPE! Don't do this. Just the ID (below) will do. Otherwise, it tries to update the object graph for Exercise!
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
            
            _repo.Add(executedWorkout, true);

            return executedWorkout;
        }

        private void ApplyQueryFilters(ref IQueryable<ExecutedWorkout> query, ExecutedWorkoutFilter filter)
        {
            if (filter == null)
                return;

            query = query.Where(x => x.CreatedByUserId == filter.UserId);

            if (filter.PlannedOnly) //TODO: Rethink. This approach is kind of kludgey. Maybe use a base class instead, and check the type.
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
        }

        #endregion Private Methods
    }
}
