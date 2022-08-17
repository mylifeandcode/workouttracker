using System;
using System.Security.Cryptography;
using System.Text;

namespace WorkoutTracker.UI.Auth
{
    public class CryptoService : ICryptoService
    {
        //This class uses a lot of help from https://www.automationmission.com/2020/09/17/hashing-and-salting-passwords-in-c/

        public string GenerateSalt()
        {
            var bytes = new byte[128 / 8];
            var randomNumberGenerator = RandomNumberGenerator.Create();
            randomNumberGenerator.GetBytes(bytes, 0, bytes.Length);
            return Convert.ToBase64String(bytes);
        }

        public string ComputeHash(string valueToHash, string salt)
        {
            byte[] bytesToHash = Encoding.UTF8.GetBytes(valueToHash);
            byte[] saltBytes = Encoding.UTF8.GetBytes(salt);
            var byteResult = new Rfc2898DeriveBytes(bytesToHash, saltBytes, 10000);
            return Convert.ToBase64String(byteResult.GetBytes(24));
        }
    }
}
