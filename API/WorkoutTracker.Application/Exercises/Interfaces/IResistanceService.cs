using System.Threading.Tasks;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Interfaces;

public interface IResistanceService
{
    Task<(decimal Amount, string? Makeup)> GetNewResistanceAmountAsync(
        ResistanceType resistanceType,
        decimal previousResistance,
        sbyte multiplier,
        bool isDoubledBands,
        bool isBilateralExercise);
}
