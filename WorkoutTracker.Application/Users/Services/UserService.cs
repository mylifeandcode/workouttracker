using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;
using WorkoutTracker.Application.Shared.BaseClasses;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Security.Interfaces;

namespace WorkoutTracker.Application.Users.Services
{
    public class UserService : ServiceBase<User>, IUserService
    {
        private ICryptoService _cryptoService;

        public UserService(IRepository<User> repo, ICryptoService cryptoService) : base(repo) 
        {
            _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
        }

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

        public void ChangePassword(int userId, string currentPassword, string newPassword)
        {
            try
            {
                var user = _repo.Get(userId);
                
                if (user == null) throw new ApplicationException("User not found.");
                if (!_cryptoService.VerifyValuesMatch(currentPassword, user.HashedPassword, user.Salt))
                    throw new ApplicationException("Current password is not correct.");
                
                user.HashedPassword = _cryptoService.ComputeHash(newPassword, user.Salt);
                _repo.Update(user, true);
            }
            catch (Exception ex)
            {
                //TODO: Log
                throw;
            }
        }
    }
}
