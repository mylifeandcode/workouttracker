using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.Application.Shared.BaseClasses;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Resistances.Services
{
    public class ResistanceBandService : ServiceBase<ResistanceBand>, IResistanceBandService
    {
        private ResistanceBand _lowestResistanceBand;

        public ResistanceBandService(IRepository<ResistanceBand> repository, ILogger<ResistanceBandService> logger) : base(repository, logger) { }

        public ResistanceBand Add(ResistanceBand resistanceBand)
        {
            return Add(resistanceBand, true);
        }

        public ResistanceBand Update(ResistanceBand resistanceBand)
        {
            return Update(resistanceBand, true);
        }

        /// <summary>
        /// Gets a list of each individual resistance band in inventory. For example, if there are 2 red bands and 3 orange bands, this will
        /// return 5 objects.
        /// </summary>
        /// <returns>A list of each individual resistance band in inventory</returns>
        public List<ResistanceBand> GetIndividualBands()
        {
            List<ResistanceBand> bandsByColor = _repo.Get().ToList();
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

        /// <summary>
        /// Calculates which resistance bands should be used to meet the specified 
        /// resistance requirements to increase resistance
        /// </summary>
        /// <param name="currentAmount">The current resistance amount</param>
        /// <param name="minimalAdjustment">The minimal amount to increase resistance by. Can be a negative number for decreasing.</param>
        /// <param name="preferredMaxAdjustment">The preferred maximum amount to increase resistance by. Can be a negative number for decreasing.</param>
        /// <param name="doubleBandResistanceAmounts">Specifies whether or not resistance amounts should be doubled, as is the case where bands are
        /// doubled over</param>
        /// <returns>
        /// A list of ResistanceBands meeting the specified criteria, or an 
        /// empty list if the criteria could not be met
        /// </returns>
        public List<ResistanceBand> GetResistanceBandsForResistanceAmountRange(
            decimal currentAmount,
            decimal minimalAdjustment,
            decimal preferredMaxAdjustment,
            bool doubleBandResistanceAmounts, 
            bool exerciseUsesBilateralResistance)
        {
            //Based on the current resistance amount, assemble a list of bands which exceeds the amount 
            //by the next available increment.

            _logger.LogInformation(
                $"Getting resisteance amount: Current = {currentAmount}, " +
                $"Min Adjustment = {minimalAdjustment}, " +
                $"Preferred Max = {preferredMaxAdjustment}, " +
                $"Double Amounts = {doubleBandResistanceAmounts}, " +
                $"Uses Bilateral = {exerciseUsesBilateralResistance}");

            byte multiplierForDoubledOverBands = doubleBandResistanceAmounts ? (byte)2 : (byte)1; //Crazy that I need to cast these!
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

            //The bands which are available for us to work with are the ones who don't have a max resistance higher than our preferred max amount.
            //We'll select these in descending order by resistance amount.
            List<ResistanceBand> availableBands = 
                GetAvailableBands(preferredMax, multiplierForDoubledOverBands, exerciseUsesBilateralResistance);

            if (exerciseUsesBilateralResistance)
                return AllocateBandsForBilateralExercise(availableBands, multiplierForDoubledOverBands, minimum, preferredMax, _logger);
            else
                return AllocateBands(availableBands, multiplierForDoubledOverBands, minimum, preferredMax);
        }
        
        /// <summary>
        /// Gets the resistance band with the lowest amount of resistance
        /// </summary>
        /// <returns>The lowest resistance band</returns>
        public ResistanceBand GetLowestResistanceBand()
        {
            if (_lowestResistanceBand == null)
                _lowestResistanceBand =
                    GetIndividualBands()
                        .MinBy(band => band.MaxResistanceAmount);

            //Still nothing? Create a default and return it.
            if (_lowestResistanceBand == null)
            {
                _lowestResistanceBand = new ResistanceBand();
                _lowestResistanceBand.MaxResistanceAmount = 3; //Safeguard against no resistance bands having been defined yet
                _lowestResistanceBand.Color = "Undefined";
            }

            return _lowestResistanceBand;
        }

        #region Private Methods

        private List<ResistanceBand> GetAvailableBands(
            decimal preferredMax, 
            byte multiplierForDoubledOverBands,
            bool forBilateralExercise)
        {
            //The bands which are available for us to work with are the ones who don't have a max resistance higher than our preferred max amount.
            //We'll select these in descending order by resistance amount.
            var bands = GetIndividualBands();
            var query = bands.Where(x => (x.MaxResistanceAmount * multiplierForDoubledOverBands) <= preferredMax);

            //For bilateral, we can only use the bands where we have more than one of the same resistance amount.
            //If we have an odd amount greater than one, take an equal amount of what we have.
            //Example: If we have 3 Onyx 40 lb bands, take 2 of them.
            //if (forBilateralExercise) query = query.Where(x => x.NumberAvailable % 2 == 0);
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

            List<ResistanceBand> selectedBands = new List<ResistanceBand>(5); //Set capacity to 5, just to be a little more optimal than default
            selectedBands.Add(availableBands[0]); //Start by selecting the one with the most resistance
            availableBands.RemoveAt(0); //The one we just selected is no longer available, so remove it from that list

            //Determine if just this first band has a resistance amount within the range we're looking for
            amountOk = AmountIsInRange(
                selectedBands[0].MaxResistanceAmount * multiplierForDoubledOverBands,
                minimum,
                preferredMax);

            if (!amountOk)
                AddBandsToSelectedListUntilResistanceCriteriaIsMet(
                    ref selectedBands, ref availableBands, minimum, preferredMax, multiplierForDoubledOverBands, true);

            return selectedBands; //Return what we've got -- it was the best we could do
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

            List<ResistanceBand> selectedBands = new List<ResistanceBand>(6); //Set capacity to 6, just to be a little more optimal than default

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

                //if (AmountIsInRange(bandsToCheckSum, minimum, preferredMax))
                if (AmountIsInRange((selectedBands.Sum(x => x.MaxResistanceAmount) * multiplierForDoubledOverBands), minimum, preferredMax))
                {
                    break; //TODO: Keep going? Maybe we can add more and still be in range?
                }
                else
                {
                    x += 2;
                    bandsLeft = x < availableBands.Count;
                    if (!bandsLeft) logger.LogDebug($"No bands left to check for bilateral resistance");
                }
            }

            return selectedBands; //Return what we've got -- it was the best we could do
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
