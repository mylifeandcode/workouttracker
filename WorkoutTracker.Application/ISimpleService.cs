using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Application
{
    public interface ISimpleService<T>
    {
        T Add(T value);
        T Update(T value);
        void Delete(int id);
        IEnumerable<T> GetAll();
        T GetById(int id);
    }
}
