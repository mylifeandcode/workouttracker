using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace WorkoutTracker.API.Models
{
    public abstract record NamedEntityDTO : EntityDTO
    {
        public NamedEntityDTO(Guid Id, DateTime CreatedDateTime, DateTime? ModifiedDateTime, [Required] string Name) 
            : base(Id, CreatedDateTime, ModifiedDateTime)
        {
        }
    }
}
