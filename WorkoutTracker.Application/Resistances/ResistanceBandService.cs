using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutApplication.Domain.Resistances;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;

namespace WorkoutTracker.Application.Resistances
{
    public class ResistanceBandService : ServiceBase<ResistanceBand>, IResistanceBandService
    {
        public ResistanceBandService(IRepository<ResistanceBand> repository) : base(repository) { }

        public ResistanceBand Add(ResistanceBand resistanceBand)
        {
            return Add(resistanceBand, true);
        }

        public ResistanceBand Update(ResistanceBand resistanceBand)
        {
            return Update(resistanceBand, true);
        }

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
        /// <param name="minimalIncrease">The minimal amount to increase resistance by</param>
        /// <param name="preferredMaxIncrease">The preferred maximum amount to increase 
        /// resistance by</param>
        /// <returns>A list of ResistanceBands meeting the specified criteria, or an 
        /// empty list if the criteria could not be met</returns>
        public List<ResistanceBand> CalculateNextAvailableResistanceAmount(
            decimal currentAmount, 
            decimal minimalIncrease, 
            decimal preferredMaxIncrease)
        {
            //Based on the current resistance amount, assemble a list of bands which exceeds the amount 
            //by the next available increment.

            decimal minimum = currentAmount + minimalIncrease;
            decimal preferredMax = currentAmount + preferredMaxIncrease;

            List<ResistanceBand> availableBands =
                GetIndividualBands()
                    .OrderByDescending(band => band.MaxResistanceAmount)
                    .ToList();

            List<ResistanceBand> selectedBands = new List<ResistanceBand>(5); //Set capacity to 5, just to be a little more optimal than default
            List<ResistanceBand> skippedBands = new List<ResistanceBand>(5);
            bool amountOk = false;

            if (currentAmount > availableBands.Max(band => band.MaxResistanceAmount))
            {
                //We're gonna need multiple bands and we can start with the one with the highest max resistance.

                selectedBands.Add(availableBands[0]);
                availableBands.RemoveAt(0);

                amountOk = AmountIsInRange(
                    selectedBands.Sum(band => band.MaxResistanceAmount), 
                    minimum,
                    preferredMax);

                if (!amountOk)
                    amountOk = AssembleListOfBandsBasedOnResistanceCriteria(
                        ref selectedBands, ref availableBands, minimum, preferredMax);

                if (!amountOk)
                {
                    //We've added bands in order from heaviest to light, but still aren't in range.
                    //Now, let's try to add what's left from light to heavy to fill the gap.
                    availableBands = skippedBands.OrderBy(band => band.MaxResistanceAmount).ToList();
                    skippedBands.Clear();

                    amountOk = AssembleListOfBandsBasedOnResistanceCriteria(
                        ref selectedBands, ref availableBands, minimum, preferredMax);
                }

                if (!amountOk)
                {
                    //We were unable to assemble a list of bands meeting our criteria. Clear the list 
                    //of selected bands so we return an empty list.
                    selectedBands.Clear();
                }
            }
            else
            {
                //Our highest max resistance band is heavier than the max we're looking for.
                //Try to target a single band. If not possible, start stacking.
                var bandThatMatchesCriteria = 
                    availableBands.FirstOrDefault(band => 
                        band.MaxResistanceAmount >= minimum 
                        && band.MaxResistanceAmount <= preferredMax);

                if (bandThatMatchesCriteria != null)
                {
                    selectedBands.Add(bandThatMatchesCriteria);
                }
                else 
                {
                    //Get to stacking...
                    availableBands =
                        GetIndividualBands()
                            .Where(band => band.MaxResistanceAmount < preferredMax)
                            .OrderByDescending(band => band.MaxResistanceAmount)
                            .ToList();

                    if (availableBands.Any())
                    {
                        selectedBands.Add(availableBands[0]);
                        availableBands.RemoveAt(0);

                        while (availableBands.Any() && !amountOk)
                        {
                            if (availableBands[0].MaxResistanceAmount + selectedBands.Sum(band => band.MaxResistanceAmount) <= preferredMax)
                            {
                                selectedBands.Add(availableBands[0]);
                                amountOk = selectedBands.Sum(band => band.MaxResistanceAmount) == preferredMax;
                            }
                            availableBands.RemoveAt(0);
                        }
                    }
                }
            }

            return selectedBands;
        }

        /// <summary>
        /// Calculates which resistance bands should be used to meet the specified 
        /// resistance requirements to decrease resistance
        /// </summary>
        /// <param name="currentAmount">The current resistance amount</param>
        /// <param name="minimalDecrease">The minimal amount to decrease resistance by</param>
        /// <param name="preferredMaxDecrease">The preferred maximum amount to decrease 
        /// resistance by</param>
        /// <returns>A list of ResistanceBands meeting the specified criteria, or an 
        /// empty list if the criteria could not be met</returns>
        public List<ResistanceBand> CalculatePreviousAvailableResistanceAmount(
            decimal currentAmount,
            decimal minimalDecrease,
            decimal preferredMaxDecrease)
        {
            //Based on the current resistance amount, assemble a list of bands which decreases the amount 
            //by the previous available decrement.
            decimal maximum = currentAmount - minimalDecrease;
            decimal preferredMin = currentAmount - preferredMaxDecrease;

            List<ResistanceBand> availableBands =
                GetIndividualBands()
                    .Where(band => band.MaxResistanceAmount <= preferredMin)
                    .OrderByDescending(band => band.MaxResistanceAmount)
                    .ToList();

            if(!availableBands.Any())
                availableBands =
                    GetIndividualBands()
                        .Where(band => band.MaxResistanceAmount <= maximum)
                        .OrderByDescending(band => band.MaxResistanceAmount)
                        .ToList();

            if (!availableBands.Any())
                return new List<ResistanceBand>(0);

            List<ResistanceBand> selectedBands = new List<ResistanceBand>(5); //Set capacity to 5, just to be a little more optimal than default

            selectedBands.Add(availableBands[0]);
            availableBands.RemoveAt(0);

            bool amountOk = AmountIsInRange(
                selectedBands.Sum(band => band.MaxResistanceAmount),
                preferredMin,
                maximum);

            if (amountOk)
                return selectedBands;

            List<ResistanceBand> skippedBands = new List<ResistanceBand>(5);

            availableBands = 
                availableBands.OrderBy(band => band.MaxResistanceAmount).ToList();

            //Try to get the preferred minimum resistance. It's okay to go over, but 
            //we can't exceed the maximum.
            amountOk = AssembleListOfBandsBasedOnResistanceCriteria(
                ref selectedBands, ref availableBands, preferredMin, maximum);

            //TODO: Refine: Attempt to get same resistance with less bands

            return selectedBands;
        }

        private static bool AssembleListOfBandsBasedOnResistanceCriteria(
            ref List<ResistanceBand> selectedBands, 
            ref List<ResistanceBand> availableBands, 
            decimal minResistance, 
            decimal maxResistance)
        {
            bool amountOk = false;
            while (!amountOk && availableBands.Any())
            {
                if (availableBands[0].MaxResistanceAmount + selectedBands.Sum(band => band.MaxResistanceAmount) <= maxResistance)
                {
                    selectedBands.Add(availableBands[0]);
                    amountOk = AmountIsInRange(selectedBands.Sum(band => band.MaxResistanceAmount), minResistance, maxResistance);
                }

                availableBands.RemoveAt(0);
            }

            return amountOk;
        }

        private static bool AmountIsInRange(decimal actual, decimal min, decimal max)
        {
            return actual >= min && actual <= max;
        }
    }
}
