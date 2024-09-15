using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Application.Shared.Interfaces
{
    public interface ISimpleService<T>
    {
        T Add(T value);
        T Update(T value);
        void Delete(int id);
        IEnumerable<T> GetAll();
        IEnumerable<T> GetAllWithoutTracking();
        T GetById(int id);
        T GetByPublicId(Guid publicId);

    }
}
