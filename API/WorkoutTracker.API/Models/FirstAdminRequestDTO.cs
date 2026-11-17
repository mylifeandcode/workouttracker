namespace WorkoutTracker.API.Models
{
    public class FirstAdminRequestDTO
    {
        public string UserName { get; set; } = string.Empty;
        public string EmailAddress { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// The code printed on the API's console while no user exists.
        /// </summary>
        public string SetupCode { get; set; } = string.Empty;
    }
}
