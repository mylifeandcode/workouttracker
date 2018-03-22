using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Data
{
    /// <summary>
    /// Extension methods for use with the WorkoutsContext class, based on a nice example I found at
    /// https://garywoodfine.com/how-to-seed-your-ef-core-database/
    /// </summary>
    public static class WorkoutsContextExtensions
    {
        public static void EnsureSeedData(this WorkoutsContext context)
        {
            int systemUserId = CreateSystemUser(context);
            SeedTargetAreas(context, systemUserId);

        }

        private static int CreateSystemUser(WorkoutsContext context)
        {
            var systemUser = context.Users.FirstOrDefault(x => x.Name == "SYSTEM");

            if (systemUser == null)
            {
                context.Users.Add(
                    new Domain.User
                    {
                        Id = 0,
                        CreatedByUserId = 0,
                        CreatedDateTime = DateTime.Now,
                        Name = "SYSTEM"
                    });

                context.SaveChanges();
                systemUser = context.Users.FirstOrDefault(x => x.Name == "SYSTEM");
                systemUser.CreatedByUserId = systemUser.Id;
                context.SaveChanges();

                if (systemUser == null)
                    throw new ApplicationException("Couldn't retrieve system user after creating it.");
            }

            return systemUser.Id;
        }

        private static void SeedTargetAreas(WorkoutsContext context, int systemUserId)
        {
            //Check for the INITIAL SET of target areas. Any later additions will be added in a later 
            //seed set.
            if (!context.TargetAreas.Any())
            {
                context.TargetAreas.Add(new TargetArea { Name = "Abs", CreatedByUserId = systemUserId, CreatedDateTime = DateTime.Now });
                context.TargetAreas.Add(new TargetArea { Name = "Back", CreatedByUserId = systemUserId, CreatedDateTime = DateTime.Now });
                context.TargetAreas.Add(new TargetArea { Name = "Biceps", CreatedByUserId = systemUserId, CreatedDateTime = DateTime.Now });
                context.TargetAreas.Add(new TargetArea { Name = "Chest", CreatedByUserId = systemUserId, CreatedDateTime = DateTime.Now });
                context.TargetAreas.Add(new TargetArea { Name = "Core", CreatedByUserId = systemUserId, CreatedDateTime = DateTime.Now });
                context.TargetAreas.Add(new TargetArea { Name = "Legs", CreatedByUserId = systemUserId, CreatedDateTime = DateTime.Now });
                context.TargetAreas.Add(new TargetArea { Name = "Shoulders", CreatedByUserId = systemUserId, CreatedDateTime = DateTime.Now });
                context.TargetAreas.Add(new TargetArea { Name = "Triceps", CreatedByUserId = systemUserId, CreatedDateTime = DateTime.Now });

                context.SaveChanges();
            }
        }
    }
}
