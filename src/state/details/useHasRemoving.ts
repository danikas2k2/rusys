import { useSelector } from 'react-redux';
import { type WithDetailsState } from '~/state/details/types';
import { useYears } from '~/state/years/useYears';

export function useHasRemoving(group: string, name: string): boolean {
    const years = useYears();
    return (
        years &&
        useSelector(
            (state: WithDetailsState) =>
                state.details?.some(
                    (v) =>
                        v.group === group &&
                        v.name === name &&
                        v.years?.some((y) => years.includes(y.year) && y.removing)
                ) ?? false
        )
    );
}
