export async function cookies() {
    return { get: () => ({ value: 'basic' }) };
}
