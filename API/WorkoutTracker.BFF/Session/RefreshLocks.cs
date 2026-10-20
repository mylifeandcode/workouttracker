using System.Collections.Concurrent;

namespace WorkoutTracker.BFF.Session
{
    /// <summary>
    /// One lock per session, shared by every request. Singleton on purpose: TokenRefreshService is scoped (it uses a
    /// typed HttpClient, which must not be captured by a singleton), but the locks have to outlive any one request.
    /// </summary>
    public class RefreshLocks
    {
        private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();

        public SemaphoreSlim For(string sessionKey) => _locks.GetOrAdd(sessionKey, _ => new SemaphoreSlim(1, 1));

        public void Forget(string sessionKey) => _locks.TryRemove(sessionKey, out _);
    }
}
