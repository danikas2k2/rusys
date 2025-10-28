import { render } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockActiveContent } from '@tests/MockActiveContent';

import React from 'react';

import { ActiveContentOutsideClick } from '~/client/pages/common/ActiveContentOutsideClick';

describe('<ActiveContentOutsideClick>', () => {
    afterEach(() => jest.clearAllMocks());

    const setActive = jest.fn();
    const ref = { current: document.createElement('div') };

    it('resets active content when clicking outside', async () => {
        render(
            <MockActiveContent active={{ data: {}, offset: 42 }} setActive={setActive}>
                <ActiveContentOutsideClick />
            </MockActiveContent>
        );

        await user.click(document.body);

        expect(setActive).toHaveBeenCalledWith();
    });

    // eslint-disable-next-line jest/prefer-ending-with-an-expect
    it('does not reset active row when clicking inside swipe controls', async () => {
        const controls = document.createElement('div');
        controls.setAttribute('data-swipe-controls', '');
        document.body.appendChild(controls);

        try {
            render(
                <MockActiveContent active={{ ref }} setActive={setActive}>
                    <ActiveContentOutsideClick />
                </MockActiveContent>
            );

            await user.click(controls);

            expect(setActive).not.toHaveBeenCalled();
        } finally {
            document.body.removeChild(controls);
        }
    });

    it('does not reset active row if row is not set', async () => {
        render(
            <MockActiveContent active={{}} setActive={setActive}>
                <ActiveContentOutsideClick />
            </MockActiveContent>
        );

        await user.click(document.body);

        expect(setActive).not.toHaveBeenCalled();
    });
});
