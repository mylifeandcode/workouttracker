using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Data.EntitySetup.Users
{
    //Not needed
    /*
    public class UserSettingsSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<UserSettings>();

            //Saved for posterity. I took a different approach, but this is how to do it to have 
            //what used to be known as a complex type property
            //entity.OwnsOne<UserRecommendationEngineSettings>(x => x.RecommendationEngineSettings);
            
            base.SetupAuditFields<UserSettings>(builder);
        }
    }
    */
}
