using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Data.EntitySetup
{
    public interface IEntitySetup
    {
        void Setup(ModelBuilder builder);
    }
}
