using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;

namespace WorkoutTracker.API.Configuration
{
    /// <summary>
    /// Reads and validates the <c>Cors:AllowedOrigins</c> setting. Cross-origin browser access is off
    /// unless origins are listed here, so a typo (or a wildcard) fails startup instead of silently
    /// widening or breaking access.
    /// </summary>
    public static class CorsOriginValidator
    {
        public const string ConfigurationKey = "Cors:AllowedOrigins";

        public static string[] GetValidatedOrigins(IConfiguration configuration)
        {
            var configured = configuration.GetSection(ConfigurationKey).Get<string[]>() ?? Array.Empty<string>();

            var origins = new List<string>();

            foreach (var rawEntry in configured)
            {
                //An unfilled environment variable (e.g. Cors__AllowedOrigins__0=) arrives as blank.
                //Treating it as "no origin" is the safe reading.
                if (string.IsNullOrWhiteSpace(rawEntry))
                    continue;

                var entry = rawEntry.Trim();

                if (!Uri.TryCreate(entry, UriKind.Absolute, out var uri))
                    throw Invalid(entry, "it is not an absolute URL (wildcards such as * are not allowed)");

                if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
                    throw Invalid(entry, "the scheme must be http or https");

                if (entry.EndsWith("/") || uri.AbsolutePath != "/" || !string.IsNullOrEmpty(uri.Query) || !string.IsNullOrEmpty(uri.Fragment))
                    throw Invalid(entry, "an origin is only scheme, host and optional port, with no path, query, fragment or trailing slash");

                if (!string.IsNullOrEmpty(uri.UserInfo))
                    throw Invalid(entry, "user info is not allowed");

                //Normalizes scheme/host casing and drops a default port (https://a.com:443 -> https://a.com),
                //which matches what browsers put in the Origin header.
                origins.Add(uri.GetLeftPart(UriPartial.Authority));
            }

            return origins.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        }

        private static InvalidOperationException Invalid(string entry, string reason)
        {
            return new InvalidOperationException(
                $"{ConfigurationKey} entry '{entry}' is invalid: {reason}. " +
                "Use full origins such as \"https://app.example.com\" or \"http://192.168.1.10:8080\".");
        }
    }
}
