using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorkoutTracker.Application.Shared.Interfaces
{
    public interface IPublicEntityServiceBase<T> : IServiceBase<T>
    {
        T GetByPublicID(Guid publicId);
    }
}
