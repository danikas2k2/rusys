import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { ActiveContentContext } from '~/client/common/ActiveContentContext';
import { ActiveContentOutsideClick } from '~/client/common/ActiveContentOutsideClick';

describe('<ActiveContentOutsideClick>', () => {
    afterEach(() => jest.clearAllMocks());

    const setActive = jest.fn();
    const ref = { current: document.createElement('div') };

    it('resets active row when clicking outside the row', async () => {
        render(
            <MockRedux>
                <ActiveContentContext value={[{ ref }, setActive]}>
                    <ActiveContentOutsideClick />
                </ActiveContentContext>
            </MockRedux>
        );
        await userEvent.click(document.body);

        expect(setActive).toHaveBeenCalledWith(undefined);
    });

    // eslint-disable-next-line jest/prefer-ending-with-an-expect
    it('does not reset active row when clicking inside swipe controls', async () => {
        const controls = document.createElement('div');
        controls.setAttribute('data-swipe-controls', '');
        document.body.appendChild(controls);

        try {
            render(
                <MockRedux>
                    <ActiveContentContext value={[{ ref }, setActive]}>
                        <ActiveContentOutsideClick />
                    </ActiveContentContext>
                </MockRedux>
            );
            await userEvent.click(controls);

            expect(setActive).not.toHaveBeenCalled();
        } finally {
            document.body.removeChild(controls);
        }
    });

    it('does not reset active row if row is not set', async () => {
        render(
            <MockRedux>
                <ActiveContentContext value={[{}, setActive]}>
                    <ActiveContentOutsideClick />
                </ActiveContentContext>
            </MockRedux>
        );
        await userEvent.click(document.body);

        expect(setActive).not.toHaveBeenCalled();
    });
});
