using System.Collections.Generic;

namespace WorkoutTracker.Application.BaseClasses
{
    public interface IServiceBase<T>
    {
        T Add(T entity, bool saveChanges = false);
        void Delete(int entityId);
        IEnumerable<T> GetAll();
        T GetById(int id);
        int GetTotalCount();
        T Update(T entity, bool saveChanges = false);
    }
}