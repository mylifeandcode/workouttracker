using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Services;

/// <summary>
/// A service for providing resistances
/// </summary>
public class ResistanceService : IResistanceService
{
    private IResistanceBandService _resistanceBandService;

    private const byte FREEWEIGHT_INCREMENT = 5;
    private const byte MACHINEWEIGHT_INCREMENT = 10;
    
    private ILogger<ResistanceService> _logger;

    //Bodylastics resistances:
    //Standard:     3, 5, 8, 13, 19, 23, 30, 40
    //Doubled-over  6, 10, 16, 26, 38, 46, 60, 80
    
    public ResistanceService(IResistanceBandService resistanceBandService, ILogger<ResistanceService> logger)
    {
        _resistanceBandService =
            resistanceBandService ?? throw new ArgumentNullException(nameof(resistanceBandService));

        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Provides a new resistance amount based on the resistance type, previous resistance amount, and a multiplier, among other factors.
    /// A negative multiplier will provide a reduced resistance while a positive one will provide an increased resistance.
    /// </summary>
    /// <param name="resistanceType">The type of resistance being used</param>
    /// <param name="previousResistance">The previous resistance amount</param>
    /// <param name="multiplier">The multiplier to use of increasing or decreasing resistance</param>
    /// <param name="isDoubledBands">For resistance bands, indicates that the bands are looped so that each end of the band is connected to the same handle</param>
    /// <param name="isBilateralExercise">Specifies that the exercise requires to separate, equal resistances</param>
    /// <param name="makeup">An output parameter for providing the makeup of resistance bands when that is the resistance type being used</param>
    /// <returns></returns>
    /// <exception cref="ApplicationException"></exception>
    public decimal GetNewResistanceAmount(
        ResistanceType resistanceType, 
        decimal previousResistance, 
        sbyte multiplier, 
        bool isDoubledBands, 
        bool isBilateralExercise, 
        out string makeup)
    {
        switch (resistanceType)
        {
            case ResistanceType.BodyWeight:
                makeup = null;
                return 0;
            
            case ResistanceType.FreeWeight:
                makeup = null;
                return GetCalculatedResistance(previousResistance, FREEWEIGHT_INCREMENT, multiplier, isBilateralExercise);
            
            case ResistanceType.MachineWeight:
                makeup = null;
                return GetCalculatedResistance(previousResistance, MACHINEWEIGHT_INCREMENT, multiplier, isBilateralExercise);
            
            case ResistanceType.ResistanceBand:
                return GetCalculatedResistanceBandResistance(previousResistance, multiplier, isDoubledBands, isBilateralExercise, out makeup);
            
            case ResistanceType.Other:
                makeup = null;
                return previousResistance; //TODO: Figure out what to do here
            
            default:
                throw new ApplicationException($"Unknown resistance type: {resistanceType}.");
        }
    }

    #region Private Methods

    private static decimal GetCalculatedResistance(decimal previousResistance, byte increment, sbyte multiplier, bool isBilateralExercise)
    {
        //Our multiplier could result in a 0 or lesser value, so let's use the increment value as a default in that case.
        //The increment represents the smallest possible resistance amount for the resistance type in question.
        if (isBilateralExercise)
            return Math.Max(previousResistance + ((increment * multiplier) * 2), increment);
        else
            return Math.Max(previousResistance + (increment * multiplier), increment);
    }
    
    private decimal GetCalculatedResistanceBandResistance(
        decimal previousResistanceAmount,
        sbyte multiplier,
        bool doubleBandResistanceAmounts,
        bool isBilateralExercise,
        out string resistanceMakeup)
    {
        decimal lowestResistanceBandAmount = _resistanceBandService.GetLowestResistanceBand()?.MaxResistanceAmount ?? 0;
        
        //We can be increasing or decreasing, so we'll use the term "adjustment"
        decimal minAdjustment = lowestResistanceBandAmount * multiplier;
        decimal maxAdjustment = minAdjustment + (multiplier > 0 ? 10 : -10);
        
        var recommendedBands =
            _resistanceBandService.GetResistanceBandsForResistanceAmountRange(
                previousResistanceAmount, minAdjustment, maxAdjustment, doubleBandResistanceAmounts, isBilateralExercise);

        if (recommendedBands.Any())
            resistanceMakeup = string.Join(',', recommendedBands.Select(band => band.Color));
        else
            resistanceMakeup = null;

        return recommendedBands.Sum(band => band.MaxResistanceAmount) * (doubleBandResistanceAmounts ? 2 : 1);
    }
    

    #endregion Private Methods
}