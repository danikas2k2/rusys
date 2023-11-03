export async function plugin<T = unknown>(plugin: string): Promise<T> {
    return (await import(plugin)).default;
}
