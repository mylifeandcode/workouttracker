namespace WorkoutTracker.UI.Auth
{
    public interface ICryptoService
    {
        string GenerateSalt();
        string ComputeHash(string valueToHash, string salt);
    }
}
