import usePreviousValue from '~/hooks/usePreviousValue';

export default function useValueChanged<T>(val: T): boolean {
    return val !== usePreviousValue(val);
}
