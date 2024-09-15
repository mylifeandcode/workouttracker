using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorkoutTracker.Domain.Interfaces
{
    public interface IPublicEntity
    {
        Guid PublicId { get; set; }
    }
}
