using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.Application.Shared.BaseClasses;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Resistances.Services
{
    public class ResistanceBandService : ServiceBase<ResistanceBand>, IResistanceBandService
    {
        private ResistanceBand? _lowestResistanceBand;

        public ResistanceBandService(IRepository<ResistanceBand> repository, ILogger<ResistanceBandService> logger) : base(repository, logger) { }

        public async Task<ResistanceBand> AddAsync(ResistanceBand resistanceBand)
        {
            return await AddAsync(resistanceBand, true);
        }

        public async Task<ResistanceBand> UpdateAsync(ResistanceBand resistanceBand)
        {
            return await UpdateAsync(resistanceBand, true);
        }

        public async Task<IEnumerable<ResistanceBand>> GetAllWithoutTrackingAsync()
        {
            return await _repo.GetAllWithoutTrackingAsync();
        }

        public async Task<ResistanceBand?> GetByPublicIdAsync(Guid publicId)
        {
            return await _repo.GetWithoutTracking().FirstOrDefaultAsync(x => x.PublicId == publicId);
        }

        public async Task<List<ResistanceBand>> GetIndividualBandsAsync()
        {
            List<ResistanceBand> bandsByColor = (await _repo.GetAllAsync()).ToList();
            List<ResistanceBand> output = new List<ResistanceBand>(bandsByColor.Sum(band => band.NumberAvailable));

            bandsByColor.ForEach((band) =>
            {
                for (short x = 0; x < band.NumberAvailable; x++)
                {
                    output.Add(new ResistanceBand { Color = band.Color, MaxResistanceAmount = band.MaxResistanceAmount, NumberAvailable = band.NumberAvailable });
                }
            });

            return output;
        }

        public async Task<List<ResistanceBand>> GetResistanceBandsForResistanceAmountRangeAsync(
            decimal currentAmount,
            decimal minimalAdjustment,
            decimal preferredMaxAdjustment,
            bool doubleBandResistanceAmounts,
            bool exerciseUsesBilateralResistance)
        {
            _logger.LogInformation(
                $"Getting resistance amount: Current = {currentAmount}, " +
                $"Min Adjustment = {minimalAdjustment}, " +
                $"Preferred Max = {preferredMaxAdjustment}, " +
                $"Double Amounts = {doubleBandResistanceAmounts}, " +
                $"Uses Bilateral = {exerciseUsesBilateralResistance}");

            byte multiplierForDoubledOverBands = doubleBandResistanceAmounts ? (byte)2 : (byte)1;
            decimal minimum;
            decimal preferredMax;

            if (minimalAdjustment > 0)
            {
                minimum = currentAmount + minimalAdjustment;
                preferredMax = currentAmount + preferredMaxAdjustment;
            }
            else
            {
                minimum = currentAmount + preferredMaxAdjustment;
                preferredMax = currentAmount + minimalAdjustment;
            }

            List<ResistanceBand> availableBands =
                await GetAvailableBandsAsync(preferredMax, multiplierForDoubledOverBands, exerciseUsesBilateralResistance);

            if (availableBands.Any())
            {
                if (exerciseUsesBilateralResistance)
                    return AllocateBandsForBilateralExercise(availableBands, multiplierForDoubledOverBands, minimum, preferredMax, _logger);
                else
                    return AllocateBands(availableBands, multiplierForDoubledOverBands, minimum, preferredMax);
            }
            else
            {
                return new List<ResistanceBand>(0);
            }
        }

        public async Task<ResistanceBand?> GetLowestResistanceBandAsync()
        {
            if (_lowestResistanceBand == null)
                _lowestResistanceBand = (await GetIndividualBandsAsync()).MinBy(band => band.MaxResistanceAmount);

            if (_lowestResistanceBand == null)
            {
                _lowestResistanceBand = new ResistanceBand();
                _lowestResistanceBand.MaxResistanceAmount = 3;
                _lowestResistanceBand.Color = "Undefined";
            }

            return _lowestResistanceBand;
        }

        #region Private Methods

        private async Task<List<ResistanceBand>> GetAvailableBandsAsync(
            decimal preferredMax,
            byte multiplierForDoubledOverBands,
            bool forBilateralExercise)
        {
            var bands = await GetIndividualBandsAsync();
            var query = bands.Where(x => (x.MaxResistanceAmount * multiplierForDoubledOverBands) <= preferredMax);

            if (forBilateralExercise)
            {
                var bandsWithOddNumber =
                    bands
                        .Where(x => x.NumberAvailable > 1 && x.NumberAvailable % 2 != 0)
                        .Distinct(new ResistanceBandColorComparer())
                        .ToList();

                var bandsToReturn = query.ToList();
                bandsWithOddNumber.ForEach(band => bandsToReturn.Remove(band));
                var revisedQuery = bandsToReturn.Where(x => x.NumberAvailable >= 2);
                return revisedQuery.OrderByDescending(x => x.MaxResistanceAmount).ToList();
            }
            else
                return query.OrderByDescending(x => x.MaxResistanceAmount).ToList();
        }

        private static List<ResistanceBand> AllocateBands(
            List<ResistanceBand> availableBands,
            byte multiplierForDoubledOverBands,
            decimal minimum,
            decimal preferredMax)
        {
            bool amountOk = false;

            List<ResistanceBand> selectedBands = new List<ResistanceBand>(5);
            selectedBands.Add(availableBands[0]);
            availableBands.RemoveAt(0);

            amountOk = AmountIsInRange(
                selectedBands[0].MaxResistanceAmount * multiplierForDoubledOverBands,
                minimum,
                preferredMax);

            if (!amountOk)
                AddBandsToSelectedListUntilResistanceCriteriaIsMet(
                    ref selectedBands, ref availableBands, minimum, preferredMax, multiplierForDoubledOverBands, true);

            return selectedBands;
        }

        private static List<ResistanceBand> AllocateBandsForBilateralExercise(
            List<ResistanceBand> availableBands,
            byte multiplierForDoubledOverBands,
            decimal minimum,
            decimal preferredMax,
            ILogger logger)
        {
            logger.LogDebug($"Allocating bands for bilateral exercise. " +
                $"Band Count: {availableBands.Count}, " +
                $"multiplierForDoubledOverBands = {multiplierForDoubledOverBands}, " +
                $"minimum = {minimum}, " +
                $"preferredMax = {preferredMax}");

            if (availableBands.Count % 2 != 0)
                throw new ApplicationException("Invalid number of bands for bilateral allottment.");

            List<ResistanceBand> selectedBands = new List<ResistanceBand>(6);

            bool bandsLeft = true;
            int x = 0;
            while (bandsLeft)
            {
                var bandsToCheck = availableBands.Skip(x).Take(2).ToArray();

                logger.LogDebug($"Checking {bandsToCheck[0].Color} bands x2 for bilateral resistance");

                var bandsToCheckSum = (bandsToCheck.Sum(x => x.MaxResistanceAmount) * multiplierForDoubledOverBands);
                var selectedBandsSum = (selectedBands.Sum(x => x.MaxResistanceAmount) * multiplierForDoubledOverBands);
                if (bandsToCheckSum > preferredMax || (bandsToCheckSum + selectedBandsSum) > preferredMax)
                {
                    logger.LogDebug($"Skipping {bandsToCheck[0].Color} bands x2 for bilateral resistance");
                    x += 2;
                    bandsLeft = x < availableBands.Count;
                    continue;
                }
                else
                {
                    logger.LogDebug($"Adding {bandsToCheck[0].Color} bands x2 for bilateral resistance");
                    selectedBands.AddRange(bandsToCheck);
                }

                if (AmountIsInRange((selectedBands.Sum(x => x.MaxResistanceAmount) * multiplierForDoubledOverBands), minimum, preferredMax))
                {
                    break;
                }
                else
                {
                    x += 2;
                    bandsLeft = x < availableBands.Count;
                    if (!bandsLeft) logger.LogDebug($"No bands left to check for bilateral resistance");
                }
            }

            return selectedBands;
        }

        private static bool AddBandsToSelectedListUntilResistanceCriteriaIsMet(
            ref List<ResistanceBand> selectedBands,
            ref List<ResistanceBand> availableBands,
            decimal minResistance,
            decimal maxResistance,
            byte multiplierForDoubledOverBands,
            bool orderAvailableBandsByDescendingResistance = false)
        {
            bool amountOk = false;

            if (orderAvailableBandsByDescendingResistance)
                availableBands = availableBands.OrderByDescending(band => band.MaxResistanceAmount).ToList();
            else
                availableBands = availableBands.OrderBy(band => band.MaxResistanceAmount).ToList();

            while (!amountOk && availableBands.Any())
            {
                var bandToEvaluate = availableBands[0];
                var bandToEvaluateMaxResistance = bandToEvaluate.MaxResistanceAmount * (multiplierForDoubledOverBands);
                var totalResistanceOfSelectedBands = (selectedBands.Sum(band => band.MaxResistanceAmount) * multiplierForDoubledOverBands);

                if (bandToEvaluateMaxResistance + totalResistanceOfSelectedBands <= maxResistance)
                {
                    selectedBands.Add(bandToEvaluate);
                    amountOk = AmountIsInRange(selectedBands.Sum(band => band.MaxResistanceAmount) * multiplierForDoubledOverBands, minResistance, maxResistance);
                }

                availableBands.RemoveAt(0);
            }

            return amountOk;
        }

        private static bool AmountIsInRange(decimal actual, decimal min, decimal max)
        {
            return actual >= min && actual <= max;
        }

        #endregion Private Methods

        private class ResistanceBandColorComparer : IEqualityComparer<ResistanceBand>
        {
            public bool Equals(ResistanceBand x, ResistanceBand y)
            {
                return x.Color == y.Color;
            }

            public int GetHashCode(ResistanceBand obj)
            {
                return obj.Color.GetHashCode();
            }
        }
    }
}
