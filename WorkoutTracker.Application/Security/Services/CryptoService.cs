using System;
using System.Security.Cryptography;
using System.Text;
using WorkoutTracker.Application.Security.Interfaces;

namespace WorkoutTracker.Application.Security.Services
{
    //TODO: Consider moving to application layer. Not sure this is the right place.
    public class CryptoService : ICryptoService
    {
        //This class uses a lot of help from https://www.automationmission.com/2020/09/17/hashing-and-salting-passwords-in-c/

        public string GenerateSalt()
        {
            var bytes = new byte[128 / 8];
            using (var randomNumberGenerator = RandomNumberGenerator.Create())
            {
                randomNumberGenerator.GetBytes(bytes, 0, bytes.Length);
                return Convert.ToBase64String(bytes);
            }
        }

        public string ComputeHash(string valueToHash, string salt)
        {
            byte[] bytesToHash = Encoding.UTF8.GetBytes(valueToHash);
            byte[] saltBytes = Encoding.UTF8.GetBytes(salt);
            using (var byteResult = new Rfc2898DeriveBytes(bytesToHash, saltBytes, 10000))
            {
                return Convert.ToBase64String(byteResult.GetBytes(24));
            }
        }

        public bool VerifyValuesMatch(string clearTextValue, string hashedValue, string salt)
        {
            string valueHashedFromClearText = ComputeHash(clearTextValue, salt);
            return valueHashedFromClearText == hashedValue;
        }

        public string GeneratePasswordResetCode()
        {
            //Based on code found at https://stackoverflow.com/questions/2271827/net-c-sharp-reset-password-random

            const string consonnants = "bcdfghjklmnpqrstvwxz";
            const string vowels = "aeiouy";

            string passwordResetCode = "";
            byte[] bytes = new byte[4];
            using (var rnd = new RNGCryptoServiceProvider())
            {
                for (int i = 0; i < 3; i++)
                {
                    rnd.GetNonZeroBytes(bytes);
                    passwordResetCode += consonnants[bytes[0] * bytes[1] % consonnants.Length];
                    passwordResetCode += vowels[bytes[2] * bytes[3] % vowels.Length];
                }

                rnd.GetBytes(bytes);
                passwordResetCode += (bytes[0] % 10).ToString() + (bytes[1] % 10).ToString();
                return passwordResetCode;
            }
        }
    }
}
