import { render } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockActiveContent } from '@tests/MockActiveContent';

import React from 'react';

import { ActiveContentOutsideClick } from '~/client/pages/common/ActiveContentOutsideClick';

describe('<ActiveContentOutsideClick>', () => {
    afterEach(() => vi.clearAllMocks());

    const setActive = vi.fn();
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

    it('does not reset active row when clicking inside swipe controls', async () => {
        const controls = document.createElement('div');
        controls.dataset.swipeControls = '';
        document.body.appendChild(controls);

        try {
            render(
                <MockActiveContent active={{ data: {}, offset: 42, ref }} setActive={setActive}>
                    <ActiveContentOutsideClick />
                </MockActiveContent>
            );

            await user.click(controls);

            expect(setActive).not.toHaveBeenCalled();
        } finally {
            controls.remove();
        }

        expect(controls).not.toBeInTheDocument();
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

    it('does not attach click listener when active has action', async () => {
        render(
            <MockActiveContent active={{ data: {}, offset: 42, action: 'update' }} setActive={setActive}>
                <ActiveContentOutsideClick />
            </MockActiveContent>
        );

        // Click should not trigger setActive because listener is not attached
        await user.click(document.body);

        expect(setActive).not.toHaveBeenCalled();
    });

    it('attaches click listener when active.offset is defined even if data is undefined', async () => {
        render(
            <MockActiveContent active={{ offset: 42 }} setActive={setActive}>
                <ActiveContentOutsideClick />
            </MockActiveContent>
        );

        // Click should trigger setActive because listener is attached (useSwipeVisible checks only offset and action)
        await user.click(document.body);

        expect(setActive).toHaveBeenCalledWith();
    });

    it('does not attach click listener when active.offset is undefined', async () => {
        render(
            <MockActiveContent active={{}} setActive={setActive}>
                <ActiveContentOutsideClick />
            </MockActiveContent>
        );

        // Click should not trigger setActive because listener is not attached
        await user.click(document.body);

        expect(setActive).not.toHaveBeenCalled();
    });

    it('does not reset when clicking on nested element inside swipe controls', async () => {
        const controls = document.createElement('div');
        controls.dataset.swipeControls = '';
        const button = document.createElement('button');
        button.textContent = 'Delete';
        controls.appendChild(button);
        document.body.appendChild(controls);

        try {
            render(
                <MockActiveContent active={{ data: {}, offset: 42 }} setActive={setActive}>
                    <ActiveContentOutsideClick />
                </MockActiveContent>
            );

            await user.click(button);

            expect(setActive).not.toHaveBeenCalled();
        } finally {
            controls.remove();
        }

        expect(controls).not.toBeInTheDocument();
    });

    it('calls setActive when clicking outside', async () => {
        render(
            <MockActiveContent active={{ data: {}, offset: 42 }} setActive={setActive}>
                <ActiveContentOutsideClick />
            </MockActiveContent>
        );

        await user.click(document.body);

        expect(setActive).toHaveBeenCalledWith();
    });
});
