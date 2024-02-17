import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type Details } from '~/common/types';
import { type WithDetailsState } from '~/state/details/types';

export const useDetails = (): ReadonlyArray<Details> =>
    useSelector((state: WithDetailsState) => state.details ?? [], isEqual);
