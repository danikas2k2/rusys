export function useDev(): boolean {
    return process.env.NODE_ENV === 'development';
}
