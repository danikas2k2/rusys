import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import { Interactive } from './Interactive';

describe('<Interactive>', () => {
    afterEach(() => jest.clearAllMocks());

    it('renders to the document', () => {
        render(<Interactive />);

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with default tabIndex', () => {
        render(<Interactive />);

        expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '-1');
    });

    it('renders with custom tabIndex', () => {
        render(<Interactive tabIndex={0} />);

        expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '0');
    });

    it('renders with custom tag', () => {
        render(<Interactive tag="span" />);

        expect(screen.getByRole('button').tagName).toBe('SPAN');
    });

    it('calls onClick when clicked', async () => {
        const onClick = jest.fn();
        render(<Interactive onClick={onClick} />);
        await userEvent.click(screen.getByRole('button'));

        expect(onClick).toHaveBeenCalledWith(expect.event('click'));
    });

    it('calls onClick when Enter key is pressed', async () => {
        const onClick = jest.fn();
        const onKeyDown = jest.fn();
        render(<Interactive onClick={onClick} onKeyDown={onKeyDown} />);
        await userEvent.type(screen.getByRole('button'), '{enter}');

        expect(onClick).toHaveBeenCalledTimes(2); // first click is to focus
        expect(onKeyDown).not.toHaveBeenCalled();
    });

    it('calls onClick when Space key is pressed', async () => {
        const onClick = jest.fn();
        const onKeyDown = jest.fn();
        render(<Interactive onClick={onClick} onKeyDown={onKeyDown} />);
        await userEvent.type(screen.getByRole('button'), '{space}');

        expect(onClick).toHaveBeenCalledTimes(2); // first click is to focus
        expect(onKeyDown).not.toHaveBeenCalled();
    });

    it('does not call onClick, but calls onKeyDown instead when other key is pressed', async () => {
        const onClick = jest.fn();
        const onKeyDown = jest.fn();
        render(<Interactive onClick={onClick} onKeyDown={onKeyDown} />);
        await userEvent.type(screen.getByRole('button'), 'a');

        expect(onClick).toHaveBeenCalledOnce(); // first click is to focus
        expect(onKeyDown).toHaveBeenCalledOnce();
        expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'a' }));
    });
});
