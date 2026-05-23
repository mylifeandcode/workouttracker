using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Domain.Resistances;

namespace WorkoutTracker.Application.Resistances.Interfaces
{
    public interface IResistanceBandService : ISimpleService<ResistanceBand>
    {
        Task<List<ResistanceBand>> GetIndividualBandsAsync();
        Task<List<ResistanceBand>> GetResistanceBandsForResistanceAmountRangeAsync(
            decimal currentAmount,
            decimal minimalIncrease,
            decimal preferredMaxIncrease,
            bool doubleBandResistanceAmounts,
            bool exerciseUsesBilateralResistance);
        Task<ResistanceBand?> GetLowestResistanceBandAsync();
    }
}
