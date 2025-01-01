using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Data.EntitySetup.Users
{
    public class UserSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entityTypeBuilder = builder.Entity<User>();

            entityTypeBuilder.Property(x => x.UserName).HasMaxLength(50).IsRequired();
            entityTypeBuilder.Property(x => x.HashedPassword).HasMaxLength(1024); //WARN: Need to restrict non-hashed password length
            entityTypeBuilder.Property(x => x.ProfilePic).HasMaxLength(4096);
            entityTypeBuilder.Property(x => x.EmailAddress).HasDefaultValue("noemail@noemail.com").IsRequired();
            entityTypeBuilder.Property(x => x.Salt).HasMaxLength(50);
            entityTypeBuilder.Property(x => x.PasswordResetCode).HasMaxLength(25);

            entityTypeBuilder.HasIndex(x => x.UserName);
            entityTypeBuilder.HasIndex(x => x.EmailAddress);

            SetupAuditFields(entityTypeBuilder);
        }

        private void SetupAuditFields(EntityTypeBuilder<User> builder)
        {
            builder.Property(x => x.CreatedByUserId).IsRequired();
            builder.Property(x => x.CreatedDateTime).IsRequired();

            builder.HasIndex(x => new
            {
                x.CreatedByUserId,
                x.CreatedDateTime,
                x.ModifiedByUserId,
                x.ModifiedDateTime
            });
        }
    }
}
