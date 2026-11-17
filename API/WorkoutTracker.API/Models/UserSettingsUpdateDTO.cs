using System.Collections.Generic;

namespace WorkoutTracker.API.Models
{
    /// <summary>
    /// A user's own settings. It is always applied to the caller, so it names no user and carries no role.
    /// </summary>
    public class UserSettingsUpdateDTO
    {
        public bool RecommendationsEnabled { get; set; }
        public byte LowestAcceptableRating { get; set; }
        public List<UserRepSettingUpdateDTO> RepSettings { get; set; } = new List<UserRepSettingUpdateDTO>();
    }

    public class UserRepSettingUpdateDTO
    {
        /// <summary>
        /// The id of one of the caller's existing rep settings, or 0 for a new one.
        /// </summary>
        public int Id { get; set; }
        public SetType SetType { get; set; }
        public ushort? Duration { get; set; }
        public byte MinReps { get; set; }
        public byte MaxReps { get; set; }
    }
}
