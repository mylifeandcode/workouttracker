using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Interfaces;

public interface IResistanceService
{
    /// <summary>
    /// Gets a new resistance amount based on the previous resistance amount and a positive or negative multiplier
    /// </summary>
    /// <param name="resistanceType">The type of resistance</param>
    /// <param name="previousResistance">The previous resistance amount</param>
    /// <param name="multiplier">A positive or negative multiplier used to adjust resistance</param>
    /// <param name="isDoubledBands">Specifies whether or not the resistance being requested is provided via doubled-over resistance bands</param>
    /// <param name="isBilateralExercise">Specifies whether or not the exercise uses two separate resistances</param>
    /// <param name="makeup">The makeup of the resistance (for example, the colors of the resistance bands if applicable)</param>
    /// <returns></returns>
    decimal GetNewResistanceAmount(ResistanceType resistanceType, decimal previousResistance, sbyte multiplier, bool isDoubledBands, bool isBilateralExercise, out string makeup);

}