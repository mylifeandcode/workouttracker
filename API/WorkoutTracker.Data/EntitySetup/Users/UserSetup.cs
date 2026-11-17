using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Data.EntitySetup.Users
{
    public class UserSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<User>();

            entity.Property(x => x.PublicId).HasDefaultValueSql("NEWID()");
            entity.Property(x => x.Name).HasMaxLength(50).IsRequired();
            entity.Property(x => x.HashedPassword).HasMaxLength(1024); //WARN: Need to restrict non-hashed password length
            entity.Property(x => x.ProfilePic).HasMaxLength(4096);
            entity.Property(x => x.EmailAddress).HasDefaultValue("noemail@noemail.com").IsRequired();
            entity.Property(x => x.Salt).HasMaxLength(50);
            entity.Property(x => x.PasswordResetTokenHash).HasMaxLength(64); //Hex SHA-256

            //The database default keeps every pre-existing user active when the column is added. ValueGeneratedNever
            //makes EF always send the property's actual value: with a default of true it would otherwise treat false
            //(the CLR default) as "not set" and quietly store true.
            entity.Property(x => x.IsActive).HasDefaultValue(true).ValueGeneratedNever();

            entity.HasIndex(x => x.Name);
            entity.HasIndex(x => x.EmailAddress);
            entity.HasIndex(x => x.PublicId);
            entity.HasIndex(x => x.PasswordResetTokenHash);

            base.SetupAuditFields<User>(builder);
        }
    }
}
