using System;
using System.Security.Cryptography;
using System.Text;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Users.Models;

namespace WorkoutTracker.Application.Users.Services
{
    /// <summary>
    /// Holds the one-time setup code. While no user exists, creating the first administrator requires
    /// this code. Two kinds of code are supported:
    /// <list type="bullet">
    /// <item>A generated code, announced through <c>announce</c> (the API console), so being able to read the
    /// server's output is what proves you are the person deploying it.</item>
    /// <item>A configured code (<c>Setup:Code</c>), chosen by the operator, for hosts where the console is not
    /// visible, such as IIS. It is never announced.</item>
    /// </list>
    /// Registered explicitly as a singleton (its name deliberately does not end in "Service", which
    /// would get it auto-registered per request and lose the code between requests).
    /// </summary>
    public class SetupCodeProvider : ISetupCodeProvider
    {
        public const int MaxFailedAttempts = 5;
        public const int MinConfiguredCodeLength = 16;
        public static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

        //Crockford base32 (no I, L, O or U), so a code read off a console is hard to mistype.
        private const string ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
        private const int GENERATED_CODE_LENGTH = 16;
        private const int GENERATED_CODE_GROUP_SIZE = 4;

        private readonly object _lock = new object();
        private readonly Action<string> _announce;
        private readonly TimeProvider _timeProvider;
        private readonly string? _configuredCode;
        private string? _code;
        private int _failedAttempts;
        private DateTimeOffset? _lockedUntil;

        /// <param name="configuredCode">Optional <c>Setup:Code</c> setting, for hosts without a visible console, and for automation (e.g. E2E).</param>
        /// <param name="announce">Receives the message telling the operator how to find a generated code.</param>
        /// <param name="timeProvider">Clock for the lockout. Defaults to the system clock.</param>
        public SetupCodeProvider(string? configuredCode, Action<string> announce, TimeProvider? timeProvider = null)
        {
            _announce = announce ?? throw new ArgumentNullException(nameof(announce));
            _timeProvider = timeProvider ?? TimeProvider.System;

            if (!string.IsNullOrWhiteSpace(configuredCode))
            {
                if (configuredCode.Trim().Length < MinConfiguredCodeLength)
                    throw new InvalidOperationException($"Setup:Code must be at least {MinConfiguredCodeLength} characters.");

                _configuredCode = configuredCode.Trim();
            }
        }

        public void EnsureActive()
        {
            string message;

            lock (_lock)
            {
                if (_code != null) return;

                _code = _configuredCode ?? Generate();
                _failedAttempts = 0;
                message = GetAnnouncement(_code);
            }

            _announce(message);
        }

        public SetupCodeResult Check(string? candidate)
        {
            string? announcement = null;

            lock (_lock)
            {
                if (_code == null) return SetupCodeResult.Invalid;

                if (_lockedUntil is { } lockedUntil)
                {
                    //Refused without looking at the candidate, so the right code gains nothing during a lockout.
                    if (_timeProvider.GetUtcNow() < lockedUntil) return SetupCodeResult.LockedOut;

                    _lockedUntil = null;
                }

                if (!string.IsNullOrWhiteSpace(candidate) && AreEqual(candidate, _code))
                    return SetupCodeResult.Valid;

                if (++_failedAttempts >= MaxFailedAttempts)
                {
                    _failedAttempts = 0;

                    if (_configuredCode != null)
                    {
                        //The operator chose this code and can't see the console, so replacing it would strand them
                        //(and let anyone force that with a few bad requests). It is long enough that guessing is not
                        //a realistic threat, so slowing the guesses down is enough.
                        _lockedUntil = _timeProvider.GetUtcNow() + LockoutDuration;
                    }
                    else
                    {
                        //Someone is guessing. Replace the code, so the guesses so far are worthless and the new one
                        //is only visible to whoever can read the server's output.
                        _code = Generate();
                        announcement = GetAnnouncement(_code);
                    }
                }
            }

            if (announcement != null) _announce(announcement);

            return SetupCodeResult.Invalid;
        }

        public void Clear()
        {
            lock (_lock)
            {
                _code = null;
                _failedAttempts = 0;
                _lockedUntil = null;
            }
        }

        private string GetAnnouncement(string code)
        {
            return ReferenceEquals(code, _configuredCode)
                ? "Initial setup required. Use the configured Setup:Code to create the first administrator."
                : $"Initial setup required. Setup code: {code}";
        }

        private static string Generate()
        {
            var bytes = RandomNumberGenerator.GetBytes(GENERATED_CODE_LENGTH);
            var code = new StringBuilder(GENERATED_CODE_LENGTH + GENERATED_CODE_LENGTH / GENERATED_CODE_GROUP_SIZE);

            for (var i = 0; i < GENERATED_CODE_LENGTH; i++)
            {
                if (i > 0 && i % GENERATED_CODE_GROUP_SIZE == 0) code.Append('-');
                code.Append(ALPHABET[bytes[i] % ALPHABET.Length]);
            }

            return code.ToString();
        }

        private static bool AreEqual(string candidate, string code)
        {
            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(Normalize(candidate)),
                Encoding.UTF8.GetBytes(Normalize(code)));
        }

        //Dashes, spaces and case are not significant, so "abcd efgh..." typed from the console still works.
        private static string Normalize(string value)
        {
            return value.Trim().Replace("-", "").Replace(" ", "").ToUpperInvariant();
        }
    }
}
