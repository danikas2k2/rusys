import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Option, Select } from '@ui/Select';
import React, { createRef } from 'react';

describe('Select', () => {
    const options = [
        <Option key="1" value="1st">
            First
        </Option>,
        <Option key="2" value="2nd">
            Second
        </Option>,
        <Option key="3" value="3rd">
            Third
        </Option>,
    ];

    afterEach(() => jest.clearAllMocks());

    it('renders to the document', () => {
        render(<Select />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders to the document with children/options', () => {
        render(<Select children={options} />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with start decorator', () => {
        render(<Select children={options} startDecorator={<div>Start</div>} />);
        expect(screen.getByText('Start')).toBeInTheDocument();
    });

    it('renders with end decorator', () => {
        render(<Select children={options} endDecorator={<div>End</div>} />);
        expect(screen.getByText('End')).toBeInTheDocument();
    });

    it('applies className prop', () => {
        render(<Select children={options} className="test-class" />);
        expect(screen.getByRole('listbox')).toHaveClass('test-class');
    });

    it('applies color class based on color prop', () => {
        render(<Select children={options} color="primary" />);
        expect(screen.getByRole('figure')).toHaveClass('color-primary');
    });

    it('applies variant class based on variant prop', () => {
        render(<Select children={options} variant="solid" />);
        expect(screen.getByRole('figure')).toHaveClass('variant-solid');
    });

    it('applies size class based on size prop', () => {
        render(<Select children={options} size="large" />);
        expect(screen.getByRole('figure')).toHaveClass('size-large');
    });

    it('applies disabled attribute based on disabled prop', () => {
        render(<Select children={options} disabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('does not apply disabled attribute when disabled prop is false', () => {
        render(<Select children={options} disabled={false} />);
        expect(screen.getByRole('textbox')).toBeEnabled();
    });

    it('applies full-width class based on fullWidth prop', () => {
        render(<Select children={options} fullWidth />);
        expect(screen.getByRole('figure')).toHaveClass('full-width');
    });

    it('applies full-height class based on fullHeight prop', () => {
        render(<Select children={options} fullHeight />);
        expect(screen.getByRole('figure')).toHaveClass('full-height');
    });

    it('applies placeholder prop', () => {
        render(<Select children={options} placeholder="test" />);
        expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'test');
    });

    it('applies read-only prop', () => {
        render(<Select children={options} readOnly />);
        expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('applies value prop', () => {
        render(<Select children={options} value="2nd" />);
        expect(screen.getByRole('textbox')).toHaveValue('Second');
    });

    it('expands options by clicking the trigger', async () => {
        render(<Select children={options} />);
        expect(screen.getByRole('listbox')).toBeCollapsed();
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        expect(screen.getByRole('listbox')).toBeExpanded();
    });

    it('expands options by clicking the input', async () => {
        render(<Select children={options} />);
        expect(screen.getByRole('listbox')).toBeCollapsed();
        await userEvent.click(screen.getByRole('textbox'));
        expect(screen.getByRole('listbox')).toBeExpanded();
    });

    it('does not expand if there is no options', async () => {
        render(<Select />);
        expect(screen.getByRole('listbox')).toBeCollapsed();
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        expect(screen.getByRole('listbox')).toBeCollapsed();
    });

    it('collapse options by clicking the trigger twice', async () => {
        render(<Select children={options} />);
        expect(screen.getByRole('listbox')).toBeCollapsed();
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        expect(screen.getByRole('listbox')).toBeCollapsed();
    });

    it('collapse options by clicking an option', async () => {
        render(<Select children={options} />);
        expect(screen.getByRole('listbox')).toBeCollapsed();
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(screen.getByRole('option', { name: 'Second' }));
        expect(screen.getByRole('listbox')).toBeCollapsed();
    });

    it('collapse options by clicking outside the select', async () => {
        render(<Select children={options} />);
        expect(screen.getByRole('listbox')).toBeCollapsed();
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(document.body);
        expect(screen.getByRole('listbox')).toBeCollapsed();
    });

    it('expands options when typing and there are some filtered options', async () => {
        render(<Select children={options} />);
        await userEvent.type(screen.getByRole('textbox'), 'fir');
        expect(screen.getByRole('listbox')).toBeExpanded();
    });

    it('collapses options when typing and all options are filtered out', async () => {
        render(<Select children={options} />);
        await userEvent.type(screen.getByRole('textbox'), 'four');
        expect(screen.getByRole('listbox')).toBeCollapsed();
    });

    it('expands options while typing and collapses when filtered out', async () => {
        render(<Select children={options} />);
        await userEvent.type(screen.getByRole('textbox'), 's');
        expect(screen.getByRole('listbox')).toBeExpanded();
        expect(screen.getAllByRole('option')).toHaveLength(2);
        await userEvent.type(screen.getByRole('textbox'), 'e');
        expect(screen.getByRole('listbox')).toBeExpanded();
        expect(screen.getAllByRole('option')).toHaveLength(1);
        await userEvent.type(screen.getByRole('textbox'), 'k');
        expect(screen.getByRole('listbox')).not.toBeExpanded();
    });

    it('expands options while typing and collapses when cleared out', async () => {
        render(<Select children={options} />);
        await userEvent.type(screen.getByRole('textbox'), 's');
        expect(screen.getByRole('listbox')).toBeExpanded();
        expect(screen.getAllByRole('option')).toHaveLength(2);
        await userEvent.type(screen.getByRole('textbox'), '{Backspace}');
        expect(screen.getByRole('listbox')).not.toBeExpanded();
    });

    it('displays filtered options', async () => {
        render(<Select children={options} />);
        await userEvent.type(screen.getByRole('textbox'), 'i');
        const opts = screen.getAllByRole('option');
        expect(opts).toHaveLength(2);
        expect(opts[0]).toHaveTextContent('First');
        expect(opts[1]).toHaveTextContent('Third');
    });

    it('has preselected option for current value', async () => {
        render(<Select children={options} value="2nd" />);
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        expect(screen.getByRole('option', { name: 'Second' })).toBeSelected();
        expect(screen.getByRole('option', { name: 'Third' })).not.toBeSelected();
    });

    it('changes selected option on click', async () => {
        render(<Select children={options} value="2nd" />);
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(screen.getByRole('option', { name: 'Third' }));
        expect(screen.getByRole('textbox')).toHaveValue('Third');
    });

    it('calls onChange when option is changed', async () => {
        const onChange = jest.fn();
        render(<Select children={options} value="2nd" onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        const option = screen.getByRole('option', { name: 'Third' });
        await userEvent.click(option);
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ target: option }), '3rd', 'Third', 2);
    });

    it('does not call onChange when option is not changed', async () => {
        const onChange = jest.fn();
        render(<Select children={options} value="2nd" onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(screen.getByRole('option', { name: 'Second' }));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('calls onClick when option is clicked even not changed', async () => {
        const onClick = jest.fn();
        render(<Select children={options} value="2nd" onClick={onClick} />);
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(screen.getByRole('option', { name: 'Second' }));
        expect(onClick).toHaveBeenCalled();
    });

    it('does not call onChange while typing', async () => {
        const onChange = jest.fn();
        render(<Select children={options} onChange={onChange} />);
        await userEvent.type(screen.getByRole('textbox'), 'sek');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('calls onInput while typing', async () => {
        const onInput = jest.fn();
        render(<Select children={options} onInput={onInput} />);
        await userEvent.type(screen.getByRole('textbox'), 'test');
        expect(onInput).toHaveBeenCalledTimes(4);
        expect(onInput).toHaveBeenLastCalledWith(
            expect.objectContaining({ target: expect.objectContaining({ value: 'test' }) })
        );
    });

    it('does not call onInput when disabled', async () => {
        const onInput = jest.fn();
        render(<Select onInput={onInput} disabled />);
        await userEvent.type(screen.getByRole('textbox'), 'test');
        expect(onInput).not.toHaveBeenCalled();
    });

    it('does not call onInput when read-only', async () => {
        const onInput = jest.fn();
        render(<Select onInput={onInput} readOnly />);
        await userEvent.type(screen.getByRole('textbox'), 'test');
        expect(onInput).not.toHaveBeenCalled();
    });

    it('calls onKeyDown and onKeyUp when key is pressed', async () => {
        const onKeyDown = jest.fn();
        const onKeyUp = jest.fn();
        render(<Select children={options} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />);
        await userEvent.type(screen.getByRole('textbox'), 'test');
        expect(onKeyDown).toHaveBeenCalledTimes(4);
        expect(onKeyUp).toHaveBeenCalledTimes(4);
    });

    it('displays clear button when value is not empty', async () => {
        render(<Select children={options} />);
        await userEvent.type(screen.getByRole('textbox'), 'ir');
        expect(screen.getByRole('button', { name: 'clear' })).toBeInTheDocument();
    });

    it('does not display clear button when input is empty', async () => {
        render(<Select children={options} />);
        await userEvent.clear(screen.getByRole('textbox'));
        expect(screen.queryByRole('button', { name: 'clear' })).not.toBeInTheDocument();
    });

    it('clears filter and collapses options when clear button is clicked', async () => {
        render(<Select children={options} />);
        await userEvent.type(screen.getByRole('textbox'), 'ir');
        expect(screen.getByRole('textbox')).toHaveValue('ir');
        expect(screen.getByRole('listbox')).toBeExpanded();
        await userEvent.click(screen.getByRole('button', { name: 'clear' }));
        expect(screen.getByRole('textbox')).toHaveValue('');
        expect(screen.getByRole('listbox')).toBeCollapsed();
    });

    it('calls onClear when clear button is clicked', async () => {
        const onClear = jest.fn();
        render(<Select children={options} onClear={onClear} />);
        await userEvent.type(screen.getByRole('textbox'), 'ir');
        await userEvent.click(screen.getByRole('button', { name: 'clear' }));
        expect(onClear).toHaveBeenCalled();
    });

    it('forwards ref', () => {
        const ref = createRef<HTMLInputElement>();
        render(<Select children={options} ref={ref} />);
        expect(ref.current).toBe(screen.getByRole('textbox'));
    });
});
