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
        /// 
        /// </summary>
        /// <param name="currentAmount"></param>
        /// <param name="minimalIncrease"></param>
        /// <param name="preferredMaxIncrease"></param>
        /// <returns></returns>
        public List<ResistanceBand> CalculateNextAvailableReistanceAmount(
            decimal currentAmount, 
            decimal minimalIncrease, 
            decimal preferredMaxIncrease)
        {
            //Based on the current resistance amount, assemble a list of bands which exceeds the amount 
            //by the next available increment.

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

                amountOk = AmountIsInRange(selectedBands.Sum(band => band.MaxResistanceAmount), minimalIncrease, preferredMaxIncrease);

                if (!amountOk)
                    amountOk = AssembleListOfBandsBasedOnResistanceCriteria(
                        ref selectedBands, ref availableBands, currentAmount + minimalIncrease, preferredMax);

                if (!amountOk)
                {
                    //We've added bands in order from heaviest to light, but still aren't in range.
                    //Now, let's try to add what's left from light to heavy to fill the gap.
                    availableBands = skippedBands.OrderBy(band => band.MaxResistanceAmount).ToList();
                    skippedBands.Clear();

                    amountOk = AssembleListOfBandsBasedOnResistanceCriteria(
                        ref selectedBands, ref availableBands, currentAmount + minimalIncrease, preferredMax);
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
                var bandThatMatchesCriteria = availableBands.FirstOrDefault(band => band.MaxResistanceAmount >= currentAmount + minimalIncrease && band.MaxResistanceAmount <= preferredMax);
                if (bandThatMatchesCriteria != null)
                {
                    selectedBands.Add(bandThatMatchesCriteria);
                }
                else 
                {
                    //Get to stacking...
                }
            }

            return selectedBands;
        }

        public List<ResistanceBand> CalculatePreviousAvailableResistanceAmount(decimal currentAmount)
        { 
        }

        private bool AssembleListOfBandsBasedOnResistanceCriteria(
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

        private List<ResistanceBand> GetResistanceBandsFromResistanceMakeup(string resistanceMakeup)
        {
            //The resistance makeup is the color of each band
            string[] bandColors = resistanceMakeup.Split(',');
            List<ResistanceBand> bands = new List<ResistanceBand>(bandColors.Length);

            bandColors.ToList().ForEach(color =>
            {
                color = color.Trim();
                bands.Add(_repo.Get().Single(band => band.Color == color));
            });

            return bands;
        }

        private bool AmountIsInRange(decimal actual, decimal min, decimal max)
        {
            return actual >= min && actual <= max;
        }
    }
}
