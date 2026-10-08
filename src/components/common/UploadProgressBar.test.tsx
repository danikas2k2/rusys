import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { UploadProgressBar } from '~/components/common/UploadProgressBar';

describe('<UploadProgressBar>', () => {
    it('hides the bar until progress is available', () => {
        const { container } = render(
            <MockTheme>
                <UploadProgressBar />
            </MockTheme>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('shows zero and later progress values', () => {
        const { rerender } = render(
            <MockTheme>
                <UploadProgressBar value={0} />
            </MockTheme>
        );

        expect(screen.getByRole('progressbar', { name: 'Upload progress' })).toHaveAttribute('aria-valuenow', '0');

        rerender(
            <MockTheme>
                <UploadProgressBar value={75} />
            </MockTheme>
        );

        expect(screen.getByRole('progressbar', { name: 'Upload progress' })).toHaveAttribute('aria-valuenow', '75');
    });
});
