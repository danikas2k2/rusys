export function compareNames(a: string, b: string): number {
    return a.trim().toLocaleLowerCase().localeCompare(b.trim().toLocaleLowerCase());
}
