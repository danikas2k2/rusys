// TODO groups should be sorted by custom order (need to be implemented)
export function compareGroups(a: string, b: string): number {
    return a.trim().toLocaleLowerCase().localeCompare(b.trim().toLocaleLowerCase());
}
