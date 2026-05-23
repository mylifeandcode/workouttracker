using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        public async Task<IEnumerable<Exercise>> GetAsync(int firstRecord, short pageSize, ExerciseFilter filter)
        {
            IQueryable<Exercise> query = _repo.GetWithoutTracking();

            if (filter != null)
                ApplyQueryFilters(ref query, filter);

            return await query.Skip(firstRecord).Take(pageSize).ToListAsync();
        }

        public async Task<Exercise?> GetByPublicIdAsync(Guid publicId)
        {
            return await _repo.GetWithoutTracking().FirstOrDefaultAsync(x => x.PublicId == publicId);
        }

        public override async Task<Exercise> UpdateAsync(Exercise modifiedExercise, bool saveChanges = false)
        {
            if (modifiedExercise == null)
                throw new ArgumentNullException(nameof(modifiedExercise));

            /*
            Remove any ExerciseTargetAreaLinks which are not present in entity.
            See https://docs.microsoft.com/en-us/ef/core/saving/disconnected-entities for
            more info.
            */
            var existingExercise = await _repo.GetAsync(modifiedExercise.Id);
            _repo.SetValues(existingExercise, modifiedExercise);

            AddExerciseTargetAreaLinksToExistingExercise(existingExercise, modifiedExercise);
            RemoveExerciseTargetAreaLinksToExistingExercise(existingExercise, modifiedExercise);

            return await _repo.UpdateAsync(existingExercise, saveChanges);
        }

        public Dictionary<int, string> GetResistanceTypes()
        {
            return
                Enum
                    .GetValues(typeof(ResistanceType))
                    .Cast<int>()
                    .ToDictionary(enumValue => enumValue, enumValue => Enum.GetName(typeof(ResistanceType), enumValue));
        }

        public async Task<int> GetTotalCountAsync(ExerciseFilter filter)
        {
            var query = _repo.GetWithoutTracking();
            ApplyQueryFilters(ref query, filter);
            return await query.CountAsync();
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
                foreach (var targetArea in filter.HasTargetAreas)
                {
                    query = query.Where(exercise =>
                        exercise.ExerciseTargetAreaLinks.Any(links =>
                            links.TargetArea != null &&
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
