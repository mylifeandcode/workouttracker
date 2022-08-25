namespace WorkoutTracker.Application.Security.Interfaces
{
    //TODO: Consider moving to application layer. Not sure this is the right place.
    public interface ICryptoService
    {
        string GenerateSalt();
        string ComputeHash(string valueToHash, string salt);
        bool VerifyValuesMatch(string clearTextPassword, string hashedPassword, string salt);
    }
}
