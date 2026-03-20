using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Data.EntitySetup.Users
{
    public class RefreshTokenSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<RefreshToken>();

            entity.Property(x => x.TokenHash).HasMaxLength(128).IsRequired();
            entity.Property(x => x.UserId).IsRequired();
            entity.Property(x => x.ExpiryDate).IsRequired();
            entity.Property(x => x.IsRevoked).IsRequired();

            entity.HasIndex(x => x.TokenHash).IsUnique();
            entity.HasIndex(x => x.UserId);

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.ReplacedByToken)
                .WithMany()
                .HasForeignKey(x => x.ReplacedByTokenId)
                .OnDelete(DeleteBehavior.NoAction);

            base.SetupAuditFields<RefreshToken>(builder);
        }
    }
}
