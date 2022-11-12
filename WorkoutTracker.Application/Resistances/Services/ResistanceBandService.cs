using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Repository;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.Application.Shared.BaseClasses;

namespace WorkoutTracker.Application.Resistances.Services
{
    public class ResistanceBandService : ServiceBase<ResistanceBand>, IResistanceBandService
    {
        private ResistanceBand _lowestResistanceBand;

        public ResistanceBandService(IRepository<ResistanceBand> repository) : base(repository) { }

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
                    output.Add(new ResistanceBand { Color = band.Color, MaxResistanceAmount = band.MaxResistanceAmount });
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
            bool doubleBandResistanceAmounts)
        {
            //Based on the current resistance amount, assemble a list of bands which exceeds the amount 
            //by the next available increment.

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

            List<ResistanceBand> selectedBands = new List<ResistanceBand>(5); //Set capacity to 5, just to be a little more optimal than default
            bool amountOk = false;

            //The bands which are available for us to work with are the ones who don't have a max resistance higher than our preferred max amount.
            //We'll select these in descending order by resistance amount.
            List<ResistanceBand> availableBands = 
                GetIndividualBands()
                    .Where(x => (x.MaxResistanceAmount * multiplierForDoubledOverBands) <= preferredMax)
                    .OrderByDescending(x => x.MaxResistanceAmount).ToList();
            
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
                if ((availableBands[0].MaxResistanceAmount * multiplierForDoubledOverBands) + (selectedBands.Sum(band => band.MaxResistanceAmount) * multiplierForDoubledOverBands) <= maxResistance)
                {
                    selectedBands.Add(availableBands[0]);
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
    }
}
