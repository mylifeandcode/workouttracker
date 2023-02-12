using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorkoutTracker.Application.Shared.Interfaces
{
    public interface IEmailService : IDisposable
    {
        bool IsEnabled { get; }
        void SendEmail(string to, string from, string subject, string body);
    }
}
