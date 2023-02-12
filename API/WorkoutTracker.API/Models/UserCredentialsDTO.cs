using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

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
