import { useSelector } from 'react-redux';
import { type BaseState } from '~/store/base/types';
import { type Name } from '~/store/types';

export default function useNameExists(name: Name): boolean {
    const match = name.trim().toLowerCase();
    return useSelector((state: BaseState) => Object.keys(state?.details ?? {}).some((k) => k.toLowerCase() === match));
}
