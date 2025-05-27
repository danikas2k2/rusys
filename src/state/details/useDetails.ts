import { useSelector } from 'react-redux';
import { type WithDetailsState } from '~/state/details/types';
import { type Details } from '~/types/data';
import { isEqual } from 'lodash';

export const useDetails = (): ReadonlyArray<Details> =>
    useSelector((state: WithDetailsState) => state.details ?? [], isEqual);
