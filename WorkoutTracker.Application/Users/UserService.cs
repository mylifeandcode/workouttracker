using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutApplication.Domain.Users;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.BaseClasses;

namespace WorkoutTracker.Application.Users
{
    public class UserService : ServiceBase<User>, IUserService
    {
        public UserService(IRepository<User> repo) : base(repo) { }

        public User Add(User user)
        {
            return Add(user, true);
        }

        public override void Delete(int userId)
        {
            //TODO: Delete entities associated with user (workouts, etc)
            base.Delete(userId);
        }

        public User Update(User user)
        {
            return Update(user, true);
        }

        public override IEnumerable<User> GetAll()
        {
            //return _repo.Get().Where(x => x.Name.ToUpper(System.Globalization.CultureInfo.CurrentCulture) != "SYSTEM");
            //TODO: Revisit this query based on the error below.
            /*
            The version above doesn't translate.
            Exception is "InvalidOperationException: 
            The LINQ expression 'DbSet<User> .Where(u => u.Name.ToUpper(__CurrentCulture_0) != "SYSTEM")' 
            could not be translated. Either rewrite the query in a form that can be translated, or switch to 
            client evaluation explicitly by inserting a call to either AsEnumerable(), AsAsyncEnumerable(), 
            ToList(), or ToListAsync(). See https://go.microsoft.com/fwlink/?linkid=2101038 for more information."
            */
            return _repo.Get().Where(x => x.Name.ToUpper() != "SYSTEM");
        }
    }
}
