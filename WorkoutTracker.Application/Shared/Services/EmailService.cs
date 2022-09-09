using System;
using System.Net.Mail;
using WorkoutTracker.Application.Shared.Interfaces;

namespace WorkoutTracker.Application.Shared.Services
{
    public class EmailService : IEmailService, IDisposable
    {
        private SmtpClient _smtpClient;
        private readonly bool _enabled;
        private bool disposedValue;

        public bool IsEnabled { get { return _enabled; } }

        public EmailService(bool enabled, string host, int port, string username, string password)
        {
            _enabled = enabled;
            if (enabled)
            { 
                _smtpClient = new SmtpClient(host, port);
                _smtpClient.UseDefaultCredentials = false;
                _smtpClient.Credentials = new System.Net.NetworkCredential(username, password);
                _smtpClient.EnableSsl = true;
            }
        }

        public void SendEmail(string to, string from, string subject, string body)
        {
            _smtpClient.Send(from, to, subject, body);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects)
                }

                // Free unmanaged resources (unmanaged objects) and override finalizer
                if (_smtpClient != null)
                    _smtpClient.Dispose();

                // TODO: set large fields to null
                disposedValue = true;
            }
        }

        // override finalizer only if 'Dispose(bool disposing)' has code to free unmanaged resources
        ~EmailService()
        {
            // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
            Dispose(disposing: false);
        }

        public void Dispose()
        {
            // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }
}
