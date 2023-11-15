export interface CommonResponse {
    ok?: boolean;
    error?: string;
}

export type Year = number;
export type Name = string;
export type Group = string;
export type GroupedSet<T> = Record<Group, Record<Name, T>>;
