import { formatFileSize } from '~/common/utils/format';

describe('formatFileSize', () => {
    it.each`
        size         | expected
        ${0}         | ${'0 B'}
        ${32}        | ${'32 B'}
        ${128}       | ${'128 B'}
        ${512}       | ${'512 B'}
        ${768}       | ${'768 B'}
        ${1000}      | ${'1 KiB'}
        ${1024}      | ${'1 KiB'}
        ${1536}      | ${'1.5 KiB'}
        ${512_000}   | ${'500 KiB'}
        ${786_000}   | ${'768 KiB'}
        ${1_000_000} | ${'1 MiB'}
        ${1_048_576} | ${'1 MiB'}
        ${1_572_864} | ${'1.5 MiB'}
        ${1.03e9}    | ${'1 GiB'}
        ${1.06e12}   | ${'1 TiB'}
        ${1.09e15}   | ${'1 PiB'}
        ${1.12e18}   | ${'1 EiB'}
        ${1.15e21}   | ${'1 ZiB'}
        ${1.18e24}   | ${'1 YiB'}
    `('formats file size $size as $expected', ({ size, expected }: { size: number; expected: string }) => {
        expect(formatFileSize(size)).toBe(expected);
    });
});
