using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Application.Shared.Interfaces;

namespace WorkoutTracker.Application.Resistances.Interfaces
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
