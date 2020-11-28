using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Resistances;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;

namespace WorkoutTracker.Application.Resistances
{
    public class ResistanceBandService : ServiceBase<ResistanceBand>, IResistanceBandService
    {
        public ResistanceBandService(IRepository<ResistanceBand> repository) : base(repository) { }

        public ResistanceBand Add(ResistanceBand resistanceBand)
        {
            return Add(resistanceBand, true);
        }

        public ResistanceBand Update(ResistanceBand resistanceBand)
        {
            return Update(resistanceBand, true);
        }
    }
}
