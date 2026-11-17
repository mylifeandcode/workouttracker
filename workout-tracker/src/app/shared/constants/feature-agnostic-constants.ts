//These constants are feature-agnostic
export const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

//Mirrors PasswordPolicy.MinLength on the API, which is what actually enforces it. Applies wherever a password is set.
export const MIN_PASSWORD_LENGTH = 12;