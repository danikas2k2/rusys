import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withReduxState } from '@tests/withReduxState';
import { ActiveRowContext } from '~/client/common/ActiveRowContext';
import { ActiveRowOutsideClick } from '~/client/common/ActiveRowOutsideClick';

jest.mock('~/state/filter/useFilter');
jest.mock('~/state/variants/useGroupVariants');
jest.mock('~/client/variants/SortableGroup', () => ({
    SortableGroup: jest.fn(jest.requireActual('~/client/variants/SortableGroup').SortableGroup),
}));

describe('<ActiveRowOutsideClick>', () => {
    afterEach(() => jest.clearAllMocks());

    const setActive = jest.fn();
    const ref = { current: document.createElement('div') };

    it('resets active row when clicking outside the row', async () => {
        render(
            <ActiveRowContext value={[{ ref }, setActive]}>
                <ActiveRowOutsideClick />
            </ActiveRowContext>,
            withReduxState()
        );
        await userEvent.click(document.body);

        expect(setActive).toHaveBeenCalledWith(undefined);
    });

    it('does not reset active row when row is pinned', async () => {
        render(
            <ActiveRowContext value={[{ ref, pinned: true }, setActive]}>
                <ActiveRowOutsideClick />
            </ActiveRowContext>,
            withReduxState()
        );
        await userEvent.click(document.body);

        expect(setActive).not.toHaveBeenCalled();
    });

    it('does not reset active row if row is not set', async () => {
        render(
            <ActiveRowContext value={[{}, setActive]}>
                <ActiveRowOutsideClick />
            </ActiveRowContext>,
            withReduxState()
        );
        await userEvent.click(document.body);

        expect(setActive).not.toHaveBeenCalled();
    });
});
