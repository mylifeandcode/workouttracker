using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Domain.Resistances;

namespace WorkoutTracker.Application.Resistances.Interfaces
{
    public interface IResistanceBandService : ISimpleService<ResistanceBand>
    {
        Task<List<ResistanceBand>> GetIndividualBandsAsync(CancellationToken cancellationToken = default);
        Task<List<ResistanceBand>> GetResistanceBandsForResistanceAmountRangeAsync(
            decimal currentAmount,
            decimal minimalIncrease,
            decimal preferredMaxIncrease,
            bool doubleBandResistanceAmounts,
            bool exerciseUsesBilateralResistance,
            CancellationToken cancellationToken = default);
        Task<ResistanceBand?> GetLowestResistanceBandAsync(CancellationToken cancellationToken = default);
    }
}
