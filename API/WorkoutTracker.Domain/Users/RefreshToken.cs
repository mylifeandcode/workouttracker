using System;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.Domain.Users
{
    public class RefreshToken : Entity
    {
        public string TokenHash { get; set; }
        public int UserId { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsRevoked { get; set; }
        public int? ReplacedByTokenId { get; set; }

        public virtual User User { get; set; }
        public virtual RefreshToken? ReplacedByToken { get; set; }
    }
}
