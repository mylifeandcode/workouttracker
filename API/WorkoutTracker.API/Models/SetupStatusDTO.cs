namespace WorkoutTracker.API.Models
{
    public class SetupStatusDTO
    {
        /// <summary>
        /// True until the first administrator has been created.
        /// </summary>
        public bool SetupRequired { get; set; }
    }
}
