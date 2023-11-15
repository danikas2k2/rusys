export interface Profile {
    aud?: string; // Identifies the audience that this ID token is intended for. It must be one of the OAuth 2.0 client IDs of your application.
    exp?: number; // The time the ID token expires, represented in Unix time (integer seconds).
    iat?: number; // The time the ID token was issued, represented in Unix time (integer seconds).
    iss?: string; // The issuer of the token
    sub?: string; // The subject of the token. An identifier for the user, unique among all Google accounts and never reused.
    at_hash?: string; // Access token hash.
    azp?: string; // The client_id of the authorized presenter.
    email?: string; // The user's email address.
    email_verified?: boolean; // True if the user's e-mail address has been verified; otherwise false.
    family_name?: string;
    given_name?: string;
    name?: string;
    picture?: string;
    allowed?: boolean;
    jti?: string;
    nbf?: number;
}

export interface WithProfileState {
    profile?: Profile;
}
