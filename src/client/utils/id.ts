export const ID_SEPARATOR = ':';

export const getId = (...parts: (string | number | boolean)[]): string => parts.join(ID_SEPARATOR);

export const parseId = (id: string | number, limit?: number): string[] => `${id}`.split(ID_SEPARATOR, limit);
