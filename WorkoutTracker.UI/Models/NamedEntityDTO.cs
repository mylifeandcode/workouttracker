using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.UI.Models
{
    public abstract record NamedEntityDTO
    {
        public int Id { get; }
        public string Name { get; }

        public NamedEntityDTO(int id, string name) => (Id, Name) = (id, name);
    }
}
