export const compare = (a: string, b: string): number =>
    a.trim().toLocaleLowerCase().localeCompare(b.trim().toLocaleLowerCase());

export const equals = (a: string, b: string): boolean => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
