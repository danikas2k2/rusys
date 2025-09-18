import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React, { createRef } from 'react';

import { Checkbox } from './Checkbox';

describe('<Checkbox>', () => {
    it('renders to the document', () => {
        render(<Checkbox>Content</Checkbox>);

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders with content', () => {
        render(<Checkbox>Content</Checkbox>);

        expect(screen.getByRole('checkbox').parentElement).toHaveTextContent('Content');
    });

    it('applies className prop', () => {
        render(<Checkbox className="test-class" />);

        expect(screen.getByRole('checkbox').parentElement).toHaveClass('test-class');
    });

    it('changes state to checked when clicked on unchecked', async () => {
        render(<Checkbox />);
        const checkbox = screen.getByRole('checkbox');
        await userEvent.click(checkbox);

        expect(checkbox).toBeChecked();
    });

    it('changes state to unchecked when clicked on checked', async () => {
        render(<Checkbox checked />);
        const checkbox = screen.getByRole('checkbox');
        await userEvent.click(checkbox);

        expect(checkbox).not.toBeChecked();
    });

    it('does not change state when clicked on disabled', async () => {
        render(<Checkbox disabled />);
        const checkbox = screen.getByRole('checkbox');
        await userEvent.click(checkbox);

        expect(checkbox).not.toBeChecked();
    });

    it('calls onChange when clicked', async () => {
        const onChange = jest.fn();
        render(<Checkbox onChange={onChange} />);
        await userEvent.click(screen.getByRole('checkbox'));

        expect(onChange).toHaveBeenCalledWith(expect.event('change'));
    });

    it('does not call onChange when disabled', async () => {
        const onChange = jest.fn();
        render(<Checkbox onChange={onChange} disabled />);
        await userEvent.click(screen.getByRole('checkbox'));

        expect(onChange).not.toHaveBeenCalled();
    });

    it('applies color class based on color prop', () => {
        render(<Checkbox color="blue" />);

        expect(screen.getByRole('checkbox').parentElement).toHaveClass('ui-color-blue');
    });

    it('applies variant class based on variant prop', () => {
        render(<Checkbox variant="solid" />);

        expect(screen.getByRole('checkbox').parentElement).toHaveClass('ui-variant-solid');
    });

    it('applies size class based on size prop', () => {
        render(<Checkbox size="large" />);

        expect(screen.getByRole('checkbox').parentElement).toHaveClass('size-large');
    });

    it('applies disabled state based on disabled prop', () => {
        render(<Checkbox disabled />);

        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('applies enabled state when disabled prop is false', () => {
        render(<Checkbox disabled={false} />);

        expect(screen.getByRole('checkbox')).toBeEnabled();
    });

    it('sets indeterminate attribute based on indeterminate prop', () => {
        render(<Checkbox indeterminate />);

        expect(screen.getByRole<HTMLInputElement>('checkbox').indeterminate).toBeTruthy();
    });

    it('does not set indeterminate attribute when indeterminate prop is false', () => {
        render(<Checkbox indeterminate={false} />);

        expect(screen.getByRole<HTMLInputElement>('checkbox').indeterminate).toBeFalsy();
    });

    it('changes state to checked when clicked on indeterminate', async () => {
        render(<Checkbox indeterminate />);
        const checkbox = screen.getByRole<HTMLInputElement>('checkbox');
        await userEvent.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(checkbox.indeterminate).toBeFalsy();
    });

    it('forwards ref', () => {
        const ref = createRef<HTMLInputElement>();
        render(<Checkbox ref={ref} />);

        expect(ref.current).toBe(screen.getByRole('checkbox'));
    });
});
