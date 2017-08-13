using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutApplication.Data.EntitySetup
{
    public class EntitySetupManager
    {
        private List<IEntitySetup> _setups;

        public EntitySetupManager()
        {
            //I could be real fancy here and set this up via IoC, but for the purpose of this class 
            //it's not really necessary.
            _setups = new List<IEntitySetup>(15); //TODO: Adjust to real count

            //TODO: Add setup classes for other entities
            _setups.Add(new ExerciseSetup());
            _setups.Add(new ExecutedExerciseSetup());
            _setups.Add(new ExerciseTargetAreaLinkSetup());
        }

        public void SetupEntities(ModelBuilder builder)
        {
            _setups.ForEach(x => x.Setup(builder));
        }
    }
}
