import { useSelector } from 'react-redux';
import { type Details } from '~/common/types';
import { type WithDetailsState } from '~/state/details/types';
import { isEqual } from 'lodash';

export const useDetails = (): ReadonlyArray<Details> =>
    useSelector((state: WithDetailsState) => state.details ?? [], isEqual);
