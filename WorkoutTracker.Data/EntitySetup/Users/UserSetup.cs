using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Data.EntitySetup.Users
{
    public class UserSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<User>();

            entity.Property(x => x.Name).HasMaxLength(50).IsRequired();
            entity.Property(x => x.HashedPassword).HasMaxLength(1024); //WARN: Need to restrict non-hashed password length
            entity.Property(x => x.ProfilePic).HasMaxLength(4096);
            entity.Property(x => x.EmailAddress).HasDefaultValue("noemail@noemail.com").IsRequired();
            entity.Property(x => x.Salt).HasMaxLength(50);
            entity.Property(x => x.PasswordResetCode).HasMaxLength(25);

            entity.HasIndex(x => x.Name);
            entity.HasIndex(x => x.EmailAddress);

            base.SetupAuditFields<User>(builder);
        }
    }
}
