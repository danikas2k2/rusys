const suffixes = 'KMGTPEZY';

function suffix(index: number): string {
    return index < 0 ? 'B' : `${suffixes[index]}iB`;
}

function trimZeroes(value: string): string {
    return value.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

export function formatFileSize(size: number): string {
    let x = -1;
    while (size >= 1024) {
        // oxlint-disable-next-line no-param-reassign
        size /= 1024;
        x++;
    }
    const digits: number = size < 1 ? 3 : size < 10 ? 2 : size < 100 ? 1 : 0;
    const sizeFormatted = `${trimZeroes(size.toFixed(digits))} ${suffix(x)}`;
    const next = trimZeroes((size / 1024).toFixed(1));
    if (next === '0') {
        return sizeFormatted;
    }
    const nextFormatted = `${next} ${suffix(x + 1)}`;
    return sizeFormatted.length <= nextFormatted.length ? sizeFormatted : nextFormatted;
}
