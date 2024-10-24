using System.ComponentModel.DataAnnotations;

namespace WorkoutTracker.API.Models
{
    public class UserCredentialsDTO
    {
        [Required]
        public string Username { get; set; }
        
        //NOT Required -- user's don't need to secure account with password. Like logging into your local Xbox without Xbox Live.
        //[Required]
        public string Password { get; set; }
    }
}
