import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, IconButton, isButtonElement } from '@ui/Button';

describe('<Button>', () => {
    it('renders to the document', () => {
        render(<Button>Content</Button>);

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with content', () => {
        render(<Button>Content</Button>);

        expect(screen.getByRole('button')).toHaveTextContent('Content');
    });

    it('renders with a button element as content', () => {
        render(
            <Button>
                <button>Inner Button</button>
            </Button>
        );

        expect(screen.getByRole('button', { name: 'Inner Button' })).toBeInTheDocument();
    });

    it('applies className prop', () => {
        render(<Button className="test-class" />);

        expect(screen.getByRole('button')).toHaveClass('test-class');
    });

    it('applies color class based on color prop', () => {
        render(<Button color="primary" />);

        expect(screen.getByRole('button')).toHaveClass('color-primary');
    });

    it('applies variant class based on variant prop', () => {
        render(<Button variant="outlined" />);

        expect(screen.getByRole('button')).toHaveClass('variant-outlined');
    });

    it('applies size class based on size prop', () => {
        render(<Button size="large" />);

        expect(screen.getByRole('button')).toHaveClass('size-large');
    });

    it('applies spacing class based on spacing prop', () => {
        render(<Button spacing="medium" />);

        expect(screen.getByRole('button')).toHaveClass('spacing-medium');
    });

    it('applies full-width class based on fullWidth prop', () => {
        render(<Button fullWidth />);

        expect(screen.getByRole('button')).toHaveClass('full-width');
    });

    it('applies full-height class based on fullHeight prop', () => {
        render(<Button fullHeight />);

        expect(screen.getByRole('button')).toHaveClass('full-height');
    });

    it('sets disabled attribute based on disabled prop', () => {
        render(<Button disabled />);

        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not set disabled attribute when disabled prop is false', () => {
        render(<Button disabled={false} />);

        expect(screen.getByRole('button')).toBeEnabled();
    });

    it('calls onClick when clicked', async () => {
        const onClick = jest.fn();
        render(<Button onClick={onClick} />);
        await userEvent.click(screen.getByRole('button'));

        expect(onClick).toHaveBeenCalledWith(expect.event('click'));
    });

    it('does not call onClick when disabled', async () => {
        const onClick = jest.fn();
        render(<Button onClick={onClick} disabled />);
        await userEvent.click(screen.getByRole('button'));

        expect(onClick).not.toHaveBeenCalled();
    });

    it('forwards ref', () => {
        const ref = createRef<HTMLButtonElement>();
        render(<Button ref={ref} />);

        expect(ref.current).toBe(screen.getByRole('button'));
    });
});

describe('<IconButton>', () => {
    it('renders to the document', () => {
        render(<IconButton />);

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with content', () => {
        render(<IconButton>Content</IconButton>);

        expect(screen.getByRole('button')).toHaveTextContent('Content');
    });

    it('renders with custom size', () => {
        render(<IconButton size="small" />);

        expect(screen.getByRole('button')).toHaveClass('size-small');
    });

    it('renders with custom variant', () => {
        render(<IconButton variant="solid" />);

        expect(screen.getByRole('button')).toHaveClass('variant-solid');
    });

    it('renders with custom spacing', () => {
        render(<IconButton spacing="medium" />);

        expect(screen.getByRole('button')).toHaveClass('spacing-medium');
    });

    it('calls onClick when clicked', async () => {
        const onClick = jest.fn();
        render(<IconButton onClick={onClick} />);
        await userEvent.click(screen.getByRole('button'));

        expect(onClick).toHaveBeenCalledWith(expect.event('click'));
    });

    it('does not call onClick when disabled', async () => {
        const onClick = jest.fn();
        render(<IconButton onClick={onClick} disabled />);
        await userEvent.click(screen.getByRole('button'));

        expect(onClick).not.toHaveBeenCalled();
    });
});

describe('isButtonElement', () => {
    it('returns true for a Button element', () => {
        const element = <Button>Content</Button>;

        expect(isButtonElement(element)).toBeTrue();
    });

    it('returns true for an IconButton element', () => {
        const element = <IconButton />;

        expect(isButtonElement(element)).toBeTrue();
    });

    it('returns false for a non-button element', () => {
        const element = <div>Not a button</div>;

        expect(isButtonElement(element)).toBeFalse();
    });

    it('returns false for null', () => {
        expect(isButtonElement(null)).toBeFalse();
    });

    it('returns false for undefined', () => {
        expect(isButtonElement(undefined)).toBeFalse();
    });
});
