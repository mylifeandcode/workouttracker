using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Services;

public class ResistanceService : IResistanceService
{
    private IResistanceBandService _resistanceBandService;

    private const byte FREEWEIGHT_INCREMENT = 5;
    private const byte MACHINEWEIGHT_INCREMENT = 10;

    private ILogger<ResistanceService> _logger;

    public ResistanceService(IResistanceBandService resistanceBandService, ILogger<ResistanceService> logger)
    {
        _resistanceBandService =
            resistanceBandService ?? throw new ArgumentNullException(nameof(resistanceBandService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<(decimal Amount, string? Makeup)> GetNewResistanceAmountAsync(
        ResistanceType resistanceType,
        decimal previousResistance,
        sbyte multiplier,
        bool isDoubledBands,
        bool isBilateralExercise)
    {
        switch (resistanceType)
        {
            case ResistanceType.BodyWeight:
                return (0, null);

            case ResistanceType.FreeWeight:
                return (GetCalculatedResistance(previousResistance, FREEWEIGHT_INCREMENT, multiplier, isBilateralExercise), null);

            case ResistanceType.MachineWeight:
                return (GetCalculatedResistance(previousResistance, MACHINEWEIGHT_INCREMENT, multiplier, isBilateralExercise), null);

            case ResistanceType.ResistanceBand:
                return await GetCalculatedResistanceBandResistanceAsync(previousResistance, multiplier, isDoubledBands, isBilateralExercise);

            case ResistanceType.Other:
                return (previousResistance, null);

            default:
                throw new ApplicationException($"Unknown resistance type: {resistanceType}.");
        }
    }

    #region Private Methods

    private static decimal GetCalculatedResistance(decimal previousResistance, byte increment, sbyte multiplier, bool isBilateralExercise)
    {
        if (isBilateralExercise)
            return Math.Max(previousResistance + ((increment * multiplier) * 2), increment);
        else
            return Math.Max(previousResistance + (increment * multiplier), increment);
    }

    private async Task<(decimal Amount, string? Makeup)> GetCalculatedResistanceBandResistanceAsync(
        decimal previousResistanceAmount,
        sbyte multiplier,
        bool doubleBandResistanceAmounts,
        bool isBilateralExercise)
    {
        var lowestBand = await _resistanceBandService.GetLowestResistanceBandAsync();
        decimal lowestResistanceBandAmount = lowestBand?.MaxResistanceAmount ?? 0;

        decimal minAdjustment = lowestResistanceBandAmount * (isBilateralExercise ? 2 : 1) * multiplier;
        decimal maxAdjustment =
            minAdjustment + (multiplier > 0 ? (isBilateralExercise ? 20 : 10) : (isBilateralExercise ? -20 : -10));

        var recommendedBands = await _resistanceBandService.GetResistanceBandsForResistanceAmountRangeAsync(
            previousResistanceAmount, minAdjustment, maxAdjustment, doubleBandResistanceAmounts, isBilateralExercise);

        //The use of Count here is not a mistake
        //https://www.jitbit.com/alexblog/316-please-stop-using-any-for-c-lists-and-arrays/
        string? makeup = recommendedBands.Count > 0
            ? string.Join(',', recommendedBands.Select(band => band.Color))
            : null;

        decimal amount = recommendedBands.Sum(band => band.MaxResistanceAmount) * (doubleBandResistanceAmounts ? 2 : 1);

        return (amount, makeup);
    }

    #endregion Private Methods
}
