using System;
using System.Linq;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Services;

public class ResistanceService : IResistanceService
{
    private IResistanceBandService _resistanceBandService;

    private const byte FREEWEIGHT_INCREMENT = 5;
    private const byte MACHINEWEIGHT_INCREMENT = 10;
    
    //Bodylastics resistances:
    //Standard:     3, 5, 8, 13, 19, 23, 30, 40
    //Doubled-over  6, 10, 16, 26, 38, 46, 60, 80
    
    public ResistanceService(IResistanceBandService resistanceBandService)
    {
        _resistanceBandService =
            resistanceBandService ?? throw new ArgumentNullException(nameof(resistanceBandService));
    }

    public decimal GetNewResistanceAmount(ResistanceType resistanceType, decimal previousResistance, sbyte multiplier, bool isDoubledBands, out string makeup)
    {
        switch (resistanceType)
        {
            case ResistanceType.BodyWeight:
                makeup = null;
                return 0;
            
            case ResistanceType.FreeWeight:
                makeup = null;
                return GetCalculatedResistance(previousResistance, FREEWEIGHT_INCREMENT, multiplier);
            
            case ResistanceType.MachineWeight:
                makeup = null;
                return GetCalculatedResistance(previousResistance, MACHINEWEIGHT_INCREMENT, multiplier);
            
            case ResistanceType.ResistanceBand:
                return GetCalculatedResistanceBandResistance(previousResistance, multiplier, isDoubledBands, out makeup);
            
            case ResistanceType.Other:
                makeup = null;
                return previousResistance; //TODO: Figure out what to do here
            
            default:
                throw new ApplicationException($"Unknown resistance type: {resistanceType}.");
        }
    }

    #region Private Methods

    private static decimal GetCalculatedResistance(decimal previousResistance, byte increment, sbyte multiplier)
    {
        return previousResistance + (increment * multiplier);
    }
    
    private decimal GetCalculatedResistanceBandResistance(
        decimal previousResistanceAmount,
        sbyte multiplier,
        bool doubleBandResistanceAmounts,
        out string resistanceMakeup)
    {
        decimal lowestResistanceBandAmount = _resistanceBandService.GetLowestResistanceBand()?.MaxResistanceAmount ?? 0;
        
        //We can be increasing or decreasing, so we'll use the term "adjustment"
        decimal minAdjustment = lowestResistanceBandAmount * multiplier;
        decimal maxAdjustment = minAdjustment + (multiplier > 0 ? 10 : -10);
        
        var recommendedBands =
            _resistanceBandService.GetResistanceBandsForResistanceAmountRange(
                previousResistanceAmount, minAdjustment, maxAdjustment, doubleBandResistanceAmounts);
        if (recommendedBands.Any())
            resistanceMakeup = string.Join(',', recommendedBands.Select(band => band.Color));
        else
            resistanceMakeup = null;

        return recommendedBands.Sum(band => band.MaxResistanceAmount);
    }
    

    #endregion Private Methods
}