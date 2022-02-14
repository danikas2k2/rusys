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
    export const locale: string;
    const config = {
        api,
        google,
        locale,
    };
    export default config;
}
