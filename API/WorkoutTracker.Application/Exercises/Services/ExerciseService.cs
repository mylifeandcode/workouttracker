﻿using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.Application.Shared.BaseClasses;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Exercises.Services
{
    public class ExerciseService : ServiceBase<Exercise>, IExerciseService
    {
        public ExerciseService(IRepository<Exercise> repo, ILogger<ExerciseService> logger) : base(repo, logger) { }

        public IEnumerable<Exercise> Get(int firstRecord, short pageSize, ExerciseFilter filter)
        {
            IQueryable<Exercise> query = _repo.GetWithoutTracking();

            if (filter != null)
                ApplyQueryFilters(ref query, filter);

            var output = query.Skip(firstRecord).Take(pageSize);
            return output;
        }

        public Exercise GetByPublicId(Guid publicId)
        {
            return _repo.GetWithoutTracking().FirstOrDefault(x => x.PublicId == publicId);
        }

        public override Exercise Update(Exercise modifiedExercise, bool saveChanges = false)
        {
            if (modifiedExercise == null)
                throw new ArgumentNullException(nameof(modifiedExercise));

            /*
            Remove any ExerciseTargetAreaLinks which are not present in entity.
            I thought there'd be an easier way to handle this, but as this is a 
            disconnected entity, apparently there is not. :/
            See https://docs.microsoft.com/en-us/ef/core/saving/disconnected-entities for 
            more info.
            */
            var existingExercise = _repo.Get(modifiedExercise.Id); //Once we do this, this entity is TRACKED
            _repo.SetValues(existingExercise, modifiedExercise);

            AddExerciseTargetAreaLinksToExistingExercise(existingExercise, modifiedExercise);
            RemoveExerciseTargetAreaLinksToExistingExercise(existingExercise, modifiedExercise);

            return _repo.Update(existingExercise, saveChanges);
        }

        public Dictionary<int, string> GetResistanceTypes()
        {
            return
                Enum
                    .GetValues(typeof(ResistanceType))
                    .Cast<int>()
                    .ToDictionary(enumValue => enumValue, enumValue => Enum.GetName(typeof(ResistanceType), enumValue));
        }

        public int GetTotalCount(ExerciseFilter filter)
        {
            var query = _repo.GetWithoutTracking();
            ApplyQueryFilters(ref query, filter);
            return query.Count();
        }

        #region Private Methods
        private void ApplyQueryFilters(ref IQueryable<Exercise> query, ExerciseFilter filter)
        {
            if (filter == null)
                return;

            if (!string.IsNullOrWhiteSpace(filter.NameContains))
                query = query.Where(exercise => EF.Functions.Like(exercise.Name, "%" + filter.NameContains + "%"));

            if (filter.HasTargetAreas != null && filter.HasTargetAreas.Any())
            {
                //filter.HasTargetAreas.ForEach((targetArea) =>
                foreach (var targetArea in filter.HasTargetAreas)
                {
                    query = query.Where(exercise =>
                        exercise.ExerciseTargetAreaLinks.Any(links =>
                            EF.Functions.Like(links.TargetArea.Name.ToUpper(), targetArea.ToUpper())));
                }
            }
        }

        private void AddExerciseTargetAreaLinksToExistingExercise(Exercise existingExercise, Exercise modifiedExercise)
        {
            foreach (var link in modifiedExercise.ExerciseTargetAreaLinks)
            {
                var existingLink =
                    existingExercise.ExerciseTargetAreaLinks
                        .FirstOrDefault(x => x.TargetAreaId == link.TargetAreaId);

                if (existingLink == null)
                    existingExercise.ExerciseTargetAreaLinks.Add(link);
            }
        }

        private void RemoveExerciseTargetAreaLinksToExistingExercise(Exercise existingExercise, Exercise modifiedExercise)
        {
            var linksToRemove = new List<ExerciseTargetAreaLink>(modifiedExercise.ExerciseTargetAreaLinks.Count);
            foreach (var existingLink in existingExercise.ExerciseTargetAreaLinks)
            {
                if (!modifiedExercise.ExerciseTargetAreaLinks.Any(x => x.TargetAreaId == existingLink.TargetAreaId))
                    linksToRemove.Add(existingLink);
            }

            foreach (var link in linksToRemove)
                existingExercise.ExerciseTargetAreaLinks.Remove(link);
        }

        #endregion Private Methods
    }
}
