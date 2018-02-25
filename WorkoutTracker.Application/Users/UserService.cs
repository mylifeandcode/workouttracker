using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutApplication.Domain;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;

namespace WorkoutTracker.Application.Users
{
    public class UserService : ServiceBase<User>, IUserService
    {
        public UserService(IRepository<User> repo) : base(repo) { }

        public User Add(User user)
        {
            return _repo.Add(user, true);
        }

        public void Delete(int userId)
        {
            //TODO: Delete entities associated with user (workouts, etc)
            _repo.Delete(userId);
        }

        public User Update(User user)
        {
            return _repo.Update(user, true);
        }

        public IEnumerable<User> GetAll()
        {
            return _repo.Get().Where(x => x.Name.ToUpper() != "SYSTEM");
        }

        public User GetById(int userId)
        {
            return _repo.Get(userId);
        }

    }
}
