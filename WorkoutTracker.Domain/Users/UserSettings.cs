using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.Domain.Users
{
    public class UserSettings : Entity
    {
        //Was tempted to just use a Dictionary<T, T> for this, but didn't want to 
        //save all settings as strings

        public int UserId { get; set; }
        //public UserGoal Goal { get; set; }
        public virtual List<UserMinMaxReps> RepSettings { get; set; }
        public bool RecommendationsEnabled { get; set; } = false;
        public byte LowestAcceptableRating { get; set; }

        //TODO: Deprecate
        public static UserSettings GetDefault()
        {
            var settings = new UserSettings();
            //settings.Goal = UserGoal.Toning;
            settings.RepSettings = new List<UserMinMaxReps>();

            settings.RepSettings.Add(new UserMinMaxReps { /*Goal = UserGoal.Toning,*/ SetType = SetType.Repetition, MinReps = 10, MaxReps = 12 });
            settings.RepSettings.Add(new UserMinMaxReps { /*Goal = UserGoal.Toning,*/ SetType = SetType.Timed, Duration = 240, MinReps = 50, MaxReps = 70 });

            settings.RecommendationsEnabled = false;

            return settings;
        }

        public static List<UserMinMaxReps> GetDefaultMinMaxRepsSettings()
        {
            var repSettings = new List<UserMinMaxReps>();
            repSettings.Add(new UserMinMaxReps { SetType = SetType.Repetition, MinReps = 10, MaxReps = 12 });
            repSettings.Add(new UserMinMaxReps { SetType = SetType.Timed, Duration = 240, MinReps = 50, MaxReps = 70 });
            return repSettings;
        }
    }
}
