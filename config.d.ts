declare module '@config' {
    export const api: {
        host: string;
        port: number;
        href: string;
    };
    export const google: {
        clientId: string;
        allowedUsers: string[];
    };
    const config = {
        api,
        google,
    };
    export default config;
}
