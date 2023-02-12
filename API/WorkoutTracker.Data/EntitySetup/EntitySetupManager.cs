using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Data.EntitySetup.Exercises;
using WorkoutTracker.Data.EntitySetup.Resistances;
using WorkoutTracker.Data.EntitySetup.Sets;
using WorkoutTracker.Data.EntitySetup.Workouts;

namespace WorkoutTracker.Data.EntitySetup
{
    public class EntitySetupManager
    {
        private List<IEntitySetup> _setups;

        public EntitySetupManager()
        {
            //I could be real fancy here and set this up via IoC, but for the purpose of this class 
            //it's not really necessary.
            _setups = new List<IEntitySetup>(16); 

            //Exercise Entity Setup
            _setups.Add(new ExerciseSetup());
            _setups.Add(new ExecutedExerciseSetup());
            _setups.Add(new TargetAreaSetup());
            _setups.Add(new ExerciseTargetAreaLinkSetup());
            _setups.Add(new ExerciseInWorkoutSetup());

            //Resistance Entity Setup
            _setups.Add(new ResistanceSetup());
            _setups.Add(new BandResistanceSetup());
            _setups.Add(new ResistanceBandSetup());

            //Set Entity Setup
            //_setups.Add(new SetSetup());
            //_setups.Add(new TimedSetSetup());
            //_setups.Add(new RepetitionSetSetup());
            _setups.Add(new ExecutedSetSetup());
            _setups.Add(new ExecutedTimedSetSetup());
            _setups.Add(new ExecutedRepetitionSetSetup());

            //Workout Entity Setup
            _setups.Add(new WorkoutSetup());
            _setups.Add(new ExecutedSetSetup());

            //User Entity Setup
            _setups.Add(new UserSetup());
        }

        public void SetupEntities(ModelBuilder builder)
        {
            _setups.ForEach(x => x.Setup(builder));
        }
    }
}
