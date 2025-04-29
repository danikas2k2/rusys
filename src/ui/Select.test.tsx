import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Option, Select } from '@ui/Select';

describe('<Select>', () => {
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
        render(<Select>{options}</Select>);

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with start decorator', () => {
        render(<Select startDecorator={<div>Start</div>}>{options}</Select>);

        expect(screen.getByText('Start')).toBeInTheDocument();
    });

    it('renders with end decorator', () => {
        render(<Select endDecorator={<div>End</div>}>{options}</Select>);

        expect(screen.getByText('End')).toBeInTheDocument();
    });

    it('applies className prop', () => {
        render(<Select className="test-class">{options}</Select>);

        expect(screen.getByRole('listbox')).toHaveClass('test-class');
    });

    it('applies color class based on color prop', () => {
        render(<Select color="primary">{options}</Select>);

        expect(screen.getByRole('figure')).toHaveClass('color-primary');
    });

    it('applies variant class based on variant prop', () => {
        render(<Select variant="solid">{options}</Select>);

        expect(screen.getByRole('figure')).toHaveClass('variant-solid');
    });

    it('applies size class based on size prop', () => {
        render(<Select size="large">{options}</Select>);

        expect(screen.getByRole('figure')).toHaveClass('size-large');
    });

    it('applies disabled attribute based on disabled prop', () => {
        render(<Select disabled>{options}</Select>);

        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('does not apply disabled attribute when disabled prop is false', () => {
        render(<Select disabled={false}>{options}</Select>);

        expect(screen.getByRole('textbox')).toBeEnabled();
    });

    it('applies full-width class based on fullWidth prop', () => {
        render(<Select fullWidth>{options}</Select>);

        expect(screen.getByRole('figure')).toHaveClass('full-width');
    });

    it('applies full-height class based on fullHeight prop', () => {
        render(<Select fullHeight>{options}</Select>);

        expect(screen.getByRole('figure')).toHaveClass('full-height');
    });

    it('applies placeholder prop', () => {
        render(<Select placeholder="test">{options}</Select>);

        expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'test');
    });

    it('applies read-only prop', () => {
        render(<Select readOnly>{options}</Select>);

        expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('applies value prop', () => {
        render(<Select value="2nd">{options}</Select>);

        expect(screen.getByRole('textbox')).toHaveValue('Second');
    });

    it('expands options by clicking the trigger', async () => {
        render(<Select>{options}</Select>);

        expect(screen.getByRole('listbox')).toBeCollapsed();

        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));

        expect(screen.getByRole('listbox')).toBeExpanded();
    });

    it('expands options by clicking the input', async () => {
        render(<Select>{options}</Select>);

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
        render(<Select>{options}</Select>);

        expect(screen.getByRole('listbox')).toBeCollapsed();

        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));

        expect(screen.getByRole('listbox')).toBeCollapsed();
    });

    it('collapse options by clicking an option', async () => {
        render(<Select>{options}</Select>);

        expect(screen.getByRole('listbox')).toBeCollapsed();

        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(screen.getByRole('option', { name: 'Second' }));

        expect(screen.getByRole('listbox')).toBeCollapsed();
    });

    it('collapse options by clicking outside the select', async () => {
        render(<Select>{options}</Select>);

        expect(screen.getByRole('listbox')).toBeCollapsed();

        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(document.body);

        expect(screen.getByRole('listbox')).toBeCollapsed();
    });

    it('expands options when typing and there are some filtered options', async () => {
        render(<Select>{options}</Select>);
        await userEvent.type(screen.getByRole('textbox'), 'fir');

        expect(screen.getByRole('listbox')).toBeExpanded();
    });

    it('collapses options when typing and all options are filtered out', async () => {
        render(<Select>{options}</Select>);
        await userEvent.type(screen.getByRole('textbox'), 'four');

        expect(screen.getByRole('listbox')).toBeCollapsed();
    });

    it('expands options while typing and collapses when filtered out', async () => {
        render(<Select>{options}</Select>);
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
        render(<Select>{options}</Select>);
        await userEvent.type(screen.getByRole('textbox'), 's');

        expect(screen.getByRole('listbox')).toBeExpanded();
        expect(screen.getAllByRole('option')).toHaveLength(2);

        await userEvent.type(screen.getByRole('textbox'), '{Backspace}');

        expect(screen.getByRole('listbox')).not.toBeExpanded();
    });

    it('displays filtered options', async () => {
        render(<Select>{options}</Select>);
        await userEvent.type(screen.getByRole('textbox'), 'i');
        const opts = screen.getAllByRole('option');

        expect(opts).toHaveLength(2);
        expect(opts[0]).toHaveTextContent('First');
        expect(opts[1]).toHaveTextContent('Third');
    });

    it('has preselected option for current value', async () => {
        render(<Select value="2nd">{options}</Select>);
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));

        expect(screen.getByRole('option', { name: 'Second' })).toBeSelected();
        expect(screen.getByRole('option', { name: 'Third' })).not.toBeSelected();
    });

    it('changes selected option on click', async () => {
        render(<Select value="2nd">{options}</Select>);
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(screen.getByRole('option', { name: 'Third' }));

        expect(screen.getByRole('textbox')).toHaveValue('Third');
    });

    it('calls onChange when option is changed', async () => {
        const onChange = jest.fn();
        render(
            <Select value="2nd" onChange={onChange}>
                {options}
            </Select>
        );
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        const option = screen.getByRole('option', { name: 'Third' });
        await userEvent.click(option);

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ target: option }), '3rd', 'Third', 2);
    });

    it('does not call onChange when option is not changed', async () => {
        const onChange = jest.fn();
        render(
            <Select value="2nd" onChange={onChange}>
                {options}
            </Select>
        );
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(screen.getByRole('option', { name: 'Second' }));

        expect(onChange).not.toHaveBeenCalled();
    });

    it('calls onClick when option is clicked even not changed', async () => {
        const onClick = jest.fn();
        render(
            <Select value="2nd" onClick={onClick}>
                {options}
            </Select>
        );
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        await userEvent.click(screen.getByRole('option', { name: 'Second' }));

        expect(onClick).toHaveBeenCalledWith(expect.event('click'));
    });

    it('does not call onChange while typing', async () => {
        const onChange = jest.fn();
        render(<Select onChange={onChange}>{options}</Select>);
        await userEvent.type(screen.getByRole('textbox'), 'sek');

        expect(onChange).not.toHaveBeenCalled();
    });

    it('calls onInput while typing', async () => {
        const onInput = jest.fn();
        render(<Select onInput={onInput}>{options}</Select>);
        await userEvent.type(screen.getByRole('textbox'), 'test');

        expect(onInput).toHaveBeenCalledTimes(4);
        expect(onInput).toHaveBeenLastCalledWith(
            expect.event('input', {
                target: expect.objectContaining({ value: 'test' }),
            })
        );
    });

    it('does not call onInput when disabled', async () => {
        const onInput = jest.fn();
        render(
            <Select onInput={onInput} disabled>
                {options}
            </Select>
        );
        await userEvent.type(screen.getByRole('textbox'), 'test');

        expect(onInput).not.toHaveBeenCalled();
    });

    it('does not call onInput when read-only', async () => {
        const onInput = jest.fn();
        render(
            <Select onInput={onInput} readOnly>
                {options}
            </Select>
        );
        await userEvent.type(screen.getByRole('textbox'), 'test');

        expect(onInput).not.toHaveBeenCalled();
    });

    it('calls onKeyDown and onKeyUp when key is pressed', async () => {
        const onKeyDown = jest.fn();
        const onKeyUp = jest.fn();
        render(
            <Select onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
                {options}
            </Select>
        );
        await userEvent.type(screen.getByRole('textbox'), 'test');

        expect(onKeyDown).toHaveBeenCalledTimes(4);
        expect(onKeyUp).toHaveBeenCalledTimes(4);
    });

    it('displays clear button when value is not empty', async () => {
        render(<Select>{options}</Select>);
        await userEvent.type(screen.getByRole('textbox'), 'ir');

        expect(screen.getByRole('button', { name: 'clear' })).toBeInTheDocument();
    });

    it('does not display clear button when input is empty', async () => {
        render(<Select>{options}</Select>);
        await userEvent.clear(screen.getByRole('textbox'));

        expect(screen.queryByRole('button', { name: 'clear' })).not.toBeInTheDocument();
    });

    it('clears filter and collapses options when clear button is clicked', async () => {
        render(<Select>{options}</Select>);
        await userEvent.type(screen.getByRole('textbox'), 'ir');

        expect(screen.getByRole('textbox')).toHaveValue('ir');
        expect(screen.getByRole('listbox')).toBeExpanded();

        await userEvent.click(screen.getByRole('button', { name: 'clear' }));

        expect(screen.getByRole('textbox')).toHaveValue('');
        expect(screen.getByRole('listbox')).toBeCollapsed();
    });

    it('calls onClear when clear button is clicked', async () => {
        const onClear = jest.fn();
        render(<Select onClear={onClear}>{options}</Select>);
        await userEvent.type(screen.getByRole('textbox'), 'ir');
        await userEvent.click(screen.getByRole('button', { name: 'clear' }));

        expect(onClear).toHaveBeenCalledWith(
            expect.event('click', {
                target: expect.objectContaining({ value: '' }),
            })
        );
    });

    it('forwards ref', () => {
        const ref = createRef<HTMLInputElement>();
        render(<Select ref={ref}>{options}</Select>);

        expect(ref.current).toBe(screen.getByRole('textbox'));
    });
});
