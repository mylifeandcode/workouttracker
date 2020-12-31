using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Users;

namespace WorkoutApplication.Data.EntitySetup
{
    public class UserSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<User>();

            entity.Property(x => x.Name).HasMaxLength(50).IsRequired();
            entity.Property(x => x.HashedPassword).HasMaxLength(1024); //WARN: Need to restrict non-hashed password length
            entity.Property(x => x.ProfilePic).HasMaxLength(4096);
            entity.HasIndex(x => x.Name);

            base.SetupAuditFields<User>(builder);
        }
    }
}
