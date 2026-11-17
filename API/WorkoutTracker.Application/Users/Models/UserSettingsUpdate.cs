using System.Collections.Generic;

namespace WorkoutTracker.Application.Users.Models
{
    /// <summary>
    /// What a user may change about their own settings, and nothing else. Deliberately not the UserSettings entity,
    /// so ids, user ids and audit fields can't be supplied by the caller.
    /// </summary>
    public record UserSettingsUpdate(
        bool RecommendationsEnabled,
        byte LowestAcceptableRating,
        IReadOnlyList<UserRepSettingUpdate> RepSettings);

    /// <param name="Id">The id of an existing rep setting belonging to this user, or 0 for a new one.
    /// An id that isn't theirs is treated as new.</param>
    public record UserRepSettingUpdate(int Id, SetType SetType, ushort? Duration, byte MinReps, byte MaxReps);
}
