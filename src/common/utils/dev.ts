export const DEV_CLIENT_ID = 'dev-mode';

export function isDevMode(): boolean {
    return process.env.NODE_ENV === 'development';
}
