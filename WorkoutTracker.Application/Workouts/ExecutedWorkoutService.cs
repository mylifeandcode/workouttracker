using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutApplication.Application.Workouts;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Workouts;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;
using WorkoutTracker.Application.Exercises;
using WorkoutTracker.Application.FilterClasses;
using WorkoutTracker.Application.Users;

namespace WorkoutTracker.Application.Workouts
{
    public class ExecutedWorkoutService : ServiceBase<ExecutedWorkout>, IExecutedWorkoutService
    {
        private IRepository<Workout> _workoutRepo;
        private IExerciseAmountRecommendationService _exerciseRecommendationService;
        private IUserService _userService;

        public ExecutedWorkoutService(
            IRepository<ExecutedWorkout> executedWorkoutRepo, 
            IRepository<Workout> workoutRepo,
            IExerciseAmountRecommendationService exerciseAmountRecommendationService, 
            IUserService userService) : base(executedWorkoutRepo) 
        {
            _workoutRepo = workoutRepo ?? throw new ArgumentNullException(nameof(workoutRepo));
            _exerciseRecommendationService = exerciseAmountRecommendationService ?? throw new ArgumentNullException(nameof(exerciseAmountRecommendationService));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        }

        public ExecutedWorkout Create(int workoutId)
        {
            //TODO: Deprecate
            try
            {
                var workout = _workoutRepo.Get(workoutId);
                if (workout == null)
                    throw new ArgumentException($"Workout {workoutId} not found.");
                else
                    return CreateNewExecutedWorkout(workout);
            }
            catch (Exception ex)
            {
                //TODO: Log
                throw;
            }
        }

        public ExecutedWorkout Create(WorkoutPlan plan)
        {
            return CreateFromPlan(plan);
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

            _repo.UpdateAsync<ExecutedWorkout>(entity, (executedWorkout) => executedWorkout.Exercises).Wait();

            return entity;
        }

        public IEnumerable<ExecutedWorkout> GetFilteredSubset(int firstRecordIndex, short subsetSize, ExecutedWorkoutFilter filter, bool newestFirst)
        {
            IQueryable<ExecutedWorkout> query = _repo.Get();

            if (filter != null)
                ApplyQueryFilters(ref query, filter);

            if (newestFirst)
                query = query.OrderByDescending(x => x.CreatedDateTime);
            else
                query = query.OrderBy(x => x.CreatedDateTime);

            var output = query.Skip(firstRecordIndex).Take(subsetSize);
            return output;
        }

        public IEnumerable<ExecutedWorkout> GetRecent(int numberOfMostRecent)
        {
            IQueryable<ExecutedWorkout> query = _repo.Get();
            var output = query
                .OrderByDescending(workout => workout.Id)
                //.Distinct(workout.Workout.Id) //TODO: Get last n number of distinct by Workout
                .Take(numberOfMostRecent);
            return output;
        }

        public ExecutedWorkout GetLatest(int workoutId)
        {
            return _repo.Get()
                .OrderByDescending(x => x.Id)
                .FirstOrDefault(x => x.WorkoutId == workoutId);
        }

        #region Private Methods
        private ExecutedWorkout CreateNewExecutedWorkout(Workout workout)
        {
            var executedWorkout = new ExecutedWorkout();
            executedWorkout.WorkoutId = workout.Id;
            executedWorkout.Exercises = new List<ExecutedExercise>(); //TODO: Initialize by known size

            foreach (var exercise in workout.Exercises?.OrderBy(x => x.Sequence))
            {
                for(byte x = 0; x < exercise.NumberOfSets; x++)
                { 
                    //TODO: Add new constructor to ExecutedExercise which takes an ExerciseInWorkout param 
                    //and initialize that way instead.
                    var exerciseToExecute = new ExecutedExercise();
                    exerciseToExecute.CreatedByUserId = workout.CreatedByUserId;
                    exerciseToExecute.CreatedDateTime = DateTime.Now.ToUniversalTime();
                    exerciseToExecute.Exercise = exercise.Exercise;
                    exerciseToExecute.ExerciseId = exercise.Exercise.Id;
                    exerciseToExecute.Sequence = x;
                    exerciseToExecute.SetType = exercise.SetType;

                    var lastWorkoutWithThisExercise = new ExecutedWorkout(); //TODO: Get last workout with this exercise!

                    ExerciseAmountRecommendation recommendation;

                    //TODO: This is temp code. Refactor for a better way of getting the current user.
                    var user = _userService.GetById(workout.CreatedByUserId);

                    if (user == null)
                        throw new ApplicationException($"Couldn't find user {workout.CreatedByUserId}");

                    var recommendationsEnabled = (user?.Settings?.RecommendationsEnabled ?? false);

                    if (recommendationsEnabled)
                        recommendation = _exerciseRecommendationService.GetRecommendation(
                            exercise.Exercise, lastWorkoutWithThisExercise); //TODO: Provide user settings!
                    else
                        recommendation = new ExerciseAmountRecommendation();

                    exerciseToExecute.TargetRepCount = recommendation.Reps;
                    exerciseToExecute.ResistanceAmount = recommendation.ResistanceAmount;
                    exerciseToExecute.ResistanceMakeup = recommendation.ResistanceMakeup;

                    executedWorkout.Exercises.Add(exerciseToExecute);
                }
            }

            return executedWorkout;
        }

        private ExecutedWorkout CreateFromPlan(WorkoutPlan plan)
        {
            var executedWorkout = new ExecutedWorkout();
            executedWorkout.WorkoutId = plan.WorkoutId;
            executedWorkout.CreatedByUserId = plan.UserId;
            executedWorkout.Exercises = new List<ExecutedExercise>(); //TODO: Initialize by known size
            var workout = _workoutRepo.Get(plan.WorkoutId);

            foreach (var exercise in workout.Exercises?.OrderBy(x => x.Sequence))
            {
                var exercisePlan = plan.Exercises.First(x => x.ExerciseId == exercise.ExerciseId);
                for (byte x = 0; x < exercise.NumberOfSets; x++)
                {
                    //TODO: Add new constructor to ExecutedExercise which takes an ExercisePlan param 
                    //and initialize that way instead.
                    var exerciseToExecute = new ExecutedExercise();
                    exerciseToExecute.CreatedByUserId = workout.CreatedByUserId;
                    exerciseToExecute.CreatedDateTime = plan.SubmittedDateTime.Value;
                    exerciseToExecute.Exercise = exercise.Exercise;
                    exerciseToExecute.ExerciseId = exercise.Exercise.Id;
                    exerciseToExecute.Sequence = x;
                    exerciseToExecute.SetType = exercise.SetType;

                    exerciseToExecute.TargetRepCount = exercisePlan.TargetRepCount;
                    exerciseToExecute.ResistanceAmount = exercisePlan.ResistanceAmount;
                    exerciseToExecute.ResistanceMakeup = exercisePlan.ResistanceMakeup;

                    executedWorkout.Exercises.Add(exerciseToExecute);
                }
            }

            executedWorkout.StartDateTime = plan.SubmittedDateTime.Value;
            _repo.Add(executedWorkout, true);

            return executedWorkout;
        }

        private void ApplyQueryFilters(ref IQueryable<ExecutedWorkout> query, ExecutedWorkoutFilter filter)
        {
            if (filter == null)
                return;

            query = query.Where(x => x.CreatedByUserId == filter.UserId);
            
            if (filter.StartDateTime.HasValue)
                query = query.Where(x => x.StartDateTime >= filter.StartDateTime);

            if (filter.EndDateTime.HasValue)
                query = query.Where(x => x.EndDateTime <= filter.EndDateTime);
        }

        #endregion Private Methods
    }
}
