export const cmp = <T extends any>(a: T, b: T) => (a < b ? -1 : +(a > b));
