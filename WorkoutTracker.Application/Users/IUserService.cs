using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain;

namespace WorkoutTracker.Application.Users
{
    public interface IUserService
    {
        User Add(User user);
        User Update(User user);
        void Delete(int userId);
        IEnumerable<User> GetAll();
        User GetById(int userId);
    }
}
