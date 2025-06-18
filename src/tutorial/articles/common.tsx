import React from 'react';

export function value(v: string | number) {
    return <code data-type={typeof v}>{v}</code>;
}

export function values(valueList: string[]) {
    return (
        <ul>
            {valueList.map((v) => (
                <li key={v}>{value(v)}</li>
            ))}
        </ul>
    );
}

export function ordered<T>(valueList: T[], defaultValue?: T): T[] {
    return defaultValue ? [defaultValue, ...valueList.filter((v) => v !== defaultValue)] : valueList;
}
