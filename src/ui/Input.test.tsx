import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@ui/Input';
import React, { createRef } from 'react';

describe('Input', () => {
    const onChange = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders to the document', () => {
        render(<Input />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with start decorator', () => {
        render(<Input startDecorator={<div>Start</div>} />);
        expect(screen.getByText('Start')).toBeInTheDocument();
    });

    it('renders with end decorator', () => {
        render(<Input endDecorator={<div>End</div>} />);
        expect(screen.getByText('End')).toBeInTheDocument();
    });

    it('applies className prop', () => {
        render(<Input className="test-class" />);
        expect(screen.getByRole('textbox').parentElement).toHaveClass('test-class');
    });

    it('calls onChange when text is entered', async () => {
        render(<Input onChange={onChange} />);
        await userEvent.type(screen.getByRole('textbox'), 'test');
        expect(onChange).toHaveBeenCalledTimes(4);
        expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ target: expect.objectContaining({ value: 'test' }) })
        );
    });

    it('does not call onChange when disabled', async () => {
        render(<Input onChange={onChange} disabled />);
        await userEvent.type(screen.getByRole('textbox'), 'test');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('applies color class based on color prop', () => {
        render(<Input color="primary" />);
        expect(screen.getByRole('textbox').parentElement).toHaveClass('color-primary');
    });

    it('applies variant class based on variant prop', () => {
        render(<Input variant="solid" />);
        expect(screen.getByRole('textbox').parentElement).toHaveClass('variant-solid');
    });

    it('applies size class based on size prop', () => {
        render(<Input size="large" />);
        expect(screen.getByRole('textbox').parentElement).toHaveClass('size-large');
    });

    it('sets disabled attribute based on disabled prop', () => {
        render(<Input disabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('does not set disabled attribute when disabled prop is false', () => {
        render(<Input disabled={false} />);
        expect(screen.getByRole('textbox')).toBeEnabled();
    });

    it('sets full-width class based on fullWidth prop', () => {
        render(<Input fullWidth />);
        expect(screen.getByRole('textbox').parentElement).toHaveClass('full-width');
    });

    it('sets full-height class based on fullHeight prop', () => {
        render(<Input fullHeight />);
        expect(screen.getByRole('textbox').parentElement).toHaveClass('full-height');
    });

    it('sets className prop', () => {
        render(<Input className="test" />);
        expect(screen.getByRole('textbox').parentElement).toHaveClass('test');
    });

    it('sets placeholder prop', () => {
        render(<Input placeholder="test" />);
        expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'test');
    });

    it('sets mode prop', () => {
        render(<Input mode="numeric" />);
        expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
    });

    it('sets value prop', () => {
        render(<Input value="test" />);
        expect(screen.getByRole('textbox')).toHaveValue('test');
    });

    it('calls onKeyDown and onKeyUp when key is pressed', async () => {
        const onKeyDown = jest.fn();
        const onKeyUp = jest.fn();
        render(<Input onKeyDown={onKeyDown} onKeyUp={onKeyUp} />);
        await userEvent.type(screen.getByRole('textbox'), 'test');
        expect(onKeyDown).toHaveBeenCalledTimes(4);
        expect(onKeyUp).toHaveBeenCalledTimes(4);
    });

    it('jump to the start of input when pressing Home button', async () => {
        render(<Input value="test" />);
        const input = screen.getByRole<HTMLInputElement>('textbox');
        await userEvent.type(input, '{home}');
        expect(input.selectionStart).toBe(0);
    });

    it('jump to the end of input when pressing End button', async () => {
        render(<Input value="test" />);
        const input = screen.getByRole<HTMLInputElement>('textbox');
        await userEvent.type(input, '{end}');
        expect(input.selectionStart).toBe(4);
    });

    it('jump to the start of input when pressing PageUp button', async () => {
        render(<Input value="test" />);
        const input = screen.getByRole<HTMLInputElement>('textbox');
        await userEvent.type(input, '{pageUp}');
        expect(input.selectionStart).toBe(0);
    });

    it('jump to the end of input when pressing PageDown button', async () => {
        render(<Input value="test" />);
        const input = screen.getByRole<HTMLInputElement>('textbox');
        await userEvent.type(input, '{pageDown}');
        expect(input.selectionStart).toBe(4);
    });

    it('forwards ref', () => {
        const ref = createRef<HTMLInputElement>();
        render(<Input ref={ref} />);
        expect(ref.current).toBe(screen.getByRole('textbox'));
    });
});
