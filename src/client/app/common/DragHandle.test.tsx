import { render, screen } from '@testing-library/react';

import React from 'react';

import { DragHandle } from '~/client/app/common/DragHandle';

describe('<DragHandle>', () => {
    it('renders drag button', () => {
        render(<DragHandle />);

        expect(screen.getByRole('button', { name: 'Drag' })).not.toHaveClass('dragging');
    });

    it('renders drag button with dragging state', () => {
        render(<DragHandle dragging />);

        expect(screen.getByRole('button', { name: 'Drag' })).toHaveClass('dragging');
    });
});
