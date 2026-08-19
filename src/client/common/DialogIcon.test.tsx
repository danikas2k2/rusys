import { render, screen } from '@testing-library/react';

import React from 'react';

import { DialogIcon } from '~/client/common/DialogIcon';

describe('<DialogIcon>', () => {
    it('is hidden from assistive technology when no label is supplied', () => {
        const { container } = render(<DialogIcon>Icon</DialogIcon>);

        expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
        expect(container.firstElementChild).not.toHaveAttribute('role');
    });

    it('uses an image role and accessible label when supplied', () => {
        render(<DialogIcon aria-label="Product icon">Icon</DialogIcon>);

        expect(screen.getByRole('img', { name: 'Product icon' })).toBeInTheDocument();
    });
});
