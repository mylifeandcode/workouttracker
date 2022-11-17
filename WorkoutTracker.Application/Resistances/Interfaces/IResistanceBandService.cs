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
        List<ResistanceBand> GetResistanceBandsForResistanceAmountRange(
            decimal currentAmount,
            decimal minimalIncrease,
            decimal preferredMaxIncrease,
            bool doubleBandResistanceAmounts);
        ResistanceBand GetLowestResistanceBand();
    }
}
