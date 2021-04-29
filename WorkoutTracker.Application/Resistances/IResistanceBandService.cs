using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Resistances;

namespace WorkoutTracker.Application.Resistances
{
    public interface IResistanceBandService : ISimpleService<ResistanceBand>
    {
        List<ResistanceBand> GetIndividualBands();
        List<ResistanceBand> CalculateNextAvailableResistanceAmount(
            decimal currentAmount,
            decimal minimalIncrease,
            decimal preferredMaxIncrease, 
            bool doubleBandResistanceAmounts);
        List<ResistanceBand> CalculatePreviousAvailableResistanceAmount(
            decimal currentAmount,
            decimal minimalDecrease,
            decimal preferredMaxDecrease, 
            bool doubleBandResistanceAmounts);
        ResistanceBand GetLowestResistanceBand();
    }
}
