using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorkoutTracker.Tests.TestHelpers.Builders
{
    public class Builder<T> where T: class
    {
        //https://ruanbeukes.net/apply-builder-pattern-to-unit-tests/

        protected T _output;

        public Builder()
        {
            Reset();
        }

        public Builder<T> With(Action<T> setAction)
        {
            setAction.Invoke(_output);
            return this;
        }

        public T Build()
        {
            var builtObject = _output;
            Reset();
            return builtObject;
        }

        protected virtual void Reset()
        {
            _output = Activator.CreateInstance<T>();
        }
    }
}
