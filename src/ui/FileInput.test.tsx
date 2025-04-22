import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@ui/Input';

describe('<Input>', () => {
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

        expect(screen.getByRole('figure')).toHaveClass('test-class');
    });

    it('applies color class based on color prop', () => {
        render(<Input color="primary" />);

        expect(screen.getByRole('figure')).toHaveClass('color-primary');
    });

    it('applies variant class based on variant prop', () => {
        render(<Input variant="solid" />);

        expect(screen.getByRole('figure')).toHaveClass('variant-solid');
    });

    it('applies size class based on size prop', () => {
        render(<Input size="large" />);

        expect(screen.getByRole('figure')).toHaveClass('size-large');
    });

    it('applies disabled attribute based on disabled prop', () => {
        render(<Input disabled />);

        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('does not apply disabled attribute when disabled prop is false', () => {
        render(<Input disabled={false} />);

        expect(screen.getByRole('textbox')).toBeEnabled();
    });

    it('applies full-width class based on fullWidth prop', () => {
        render(<Input fullWidth />);

        expect(screen.getByRole('figure')).toHaveClass('full-width');
    });

    it('applies full-height class based on fullHeight prop', () => {
        render(<Input fullHeight />);

        expect(screen.getByRole('figure')).toHaveClass('full-height');
    });

    it('applies placeholder prop', () => {
        render(<Input placeholder="test" />);

        expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'test');
    });

    it('applies read-only prop', () => {
        render(<Input readOnly />);

        expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('applies mode prop', () => {
        render(<Input mode="numeric" />);

        expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
    });

    it('applies value prop', () => {
        render(<Input value="test" onChange={onChange} />);

        expect(screen.getByRole('textbox')).toHaveValue('test');
    });

    it('applies defaultValue prop', () => {
        render(<Input defaultValue="test" />);

        expect(screen.getByRole('textbox')).toHaveValue('test');
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

    it('calls onInput when text is entered', async () => {
        const onInput = jest.fn();
        render(<Input onInput={onInput} />);
        await userEvent.type(screen.getByRole('textbox'), 'test');

        expect(onInput).toHaveBeenCalledTimes(4);
        expect(onInput).toHaveBeenLastCalledWith(
            expect.objectContaining({ target: expect.objectContaining({ value: 'test' }) })
        );
    });

    it('does not call onInput when disabled', async () => {
        const onInput = jest.fn();
        render(<Input onInput={onInput} disabled />);
        await userEvent.type(screen.getByRole('textbox'), 'test');

        expect(onInput).not.toHaveBeenCalled();
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
        render(<Input value="test" onChange={onChange} />);
        const input = screen.getByRole<HTMLInputElement>('textbox');
        await userEvent.type(input, '{home}');

        expect(input.selectionStart).toBe(0);
    });

    it('jump to the end of input when pressing End button', async () => {
        render(<Input value="test" onChange={onChange} />);
        const input = screen.getByRole<HTMLInputElement>('textbox');
        await userEvent.type(input, '{end}');

        expect(input.selectionStart).toBe(4);
    });

    it('jump to the start of input when pressing PageUp button', async () => {
        render(<Input value="test" onChange={onChange} />);
        const input = screen.getByRole<HTMLInputElement>('textbox');
        await userEvent.type(input, '{pageUp}');

        expect(input.selectionStart).toBe(0);
    });

    it('jump to the end of input when pressing PageDown button', async () => {
        render(<Input value="test" onChange={onChange} />);
        const input = screen.getByRole<HTMLInputElement>('textbox');
        await userEvent.type(input, '{pageDown}');

        expect(input.selectionStart).toBe(4);
    });

    it('displays clear button when value is not empty', async () => {
        render(<Input clearable value="test" onChange={onChange} />);

        expect(screen.getByRole('button', { name: 'clear' })).toBeInTheDocument();
    });

    it('displays clear button when defaultValue is not empty', async () => {
        render(<Input clearable defaultValue="test" />);

        expect(screen.getByRole('button', { name: 'clear' })).toBeInTheDocument();
    });

    it('does not display clear button when input is empty', async () => {
        render(<Input clearable />);

        expect(screen.queryByRole('button', { name: 'clear' })).not.toBeInTheDocument();
    });

    it('displays clear button while typing and hides when input is cleared', async () => {
        render(<Input clearable />);
        await userEvent.type(screen.getByRole('textbox'), 'test');

        expect(screen.getByRole('button', { name: 'clear' })).toBeInTheDocument();

        await userEvent.clear(screen.getByRole('textbox'));

        expect(screen.queryByRole('button', { name: 'clear' })).not.toBeInTheDocument();
    });

    it('clears uncontrolled input when clear button is clicked', async () => {
        render(<Input clearable defaultValue="test" />);
        await userEvent.click(screen.getByRole('button', { name: 'clear' }));

        expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('does not clear controlled input when clear button is clicked', async () => {
        render(<Input clearable value="test" onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'clear' }));

        expect(screen.getByRole('textbox')).toHaveValue('test');
    });

    it('calls onClear when clear button is clicked', async () => {
        const onClear = jest.fn();
        render(<Input clearable value="test" onChange={onChange} onClear={onClear} />);
        await userEvent.click(screen.getByRole('button'));

        expect(onClear).toHaveBeenCalledWith(expect.event('click'));
    });

    it('forwards ref', () => {
        const ref = createRef<HTMLInputElement>();
        render(<Input ref={ref} />);

        expect(ref.current).toBe(screen.getByRole('textbox'));
    });
});
