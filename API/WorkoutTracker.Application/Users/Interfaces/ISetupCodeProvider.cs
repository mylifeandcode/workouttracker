using WorkoutTracker.Application.Users.Models;

namespace WorkoutTracker.Application.Users.Interfaces
{
    /// <summary>
    /// Holds the one-time code that must accompany the creation of the first administrator.
    /// </summary>
    public interface ISetupCodeProvider
    {
        /// <summary>
        /// Makes sure a code is active, creating (and announcing) one if there isn't. Idempotent.
        /// </summary>
        void EnsureActive();

        /// <summary>
        /// Checks a candidate against the active code. Wrong guesses are counted: enough of them in a row replace a
        /// generated code with a new one, or lock out a configured code for a while.
        /// </summary>
        SetupCodeResult Check(string? candidate);

        /// <summary>
        /// Deactivates the current code. Called once setup has completed. A code that was supplied through
        /// configuration becomes active again the next time <see cref="EnsureActive"/> is called.
        /// </summary>
        void Clear();
    }
}
