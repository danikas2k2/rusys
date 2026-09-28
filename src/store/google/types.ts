export interface Google {
    loading?: boolean;
    clientId?: string;
}

export interface WithGoogleState {
    google?: Readonly<Google>;
}
