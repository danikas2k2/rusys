declare module '@config' {
    export const locale: string;
    export const web: string;
    export const api: string;
    export const google: {
        clientId: string;
        allowedUsers: string[];
    };
    const config = {
        locale,
        web,
        api,
        google,
    };
    export default config;
}
