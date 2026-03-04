import { isEmpty } from 'lodash';

import { useHistory } from '~/client/state/history/useHistory';

export function useHistoryHasData() {
    const history = useHistory();
    return !isEmpty(history);
}
