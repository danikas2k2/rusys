import type { LoaderContext } from 'webpack';
import inlineCssModules from './webpack.cssModuleWrapper';

describe('webpack.inlineCssModules', () => {
    const context = {
        getOptions: () => ({}),
    } as LoaderContext<object>;

    it('only one css file is imported', () => {
        expect(
            inlineCssModules
                .call(
                    context,
                    Buffer.from(`
import React from 'react';
import classNames from 'classnames';
import './Button.css';

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames(
            'Button',
            \`color-\${color}\`,
            \`variant-\${variant}\`,
            \`size-\${size}\`,
            \`spacing-\${spacing}\`
        )}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`)
                )
                ?.toString()
        ).toBe(`
import React from 'react';
import classNames__bind from 'classnames/bind';
import __Button_css from './Button.css';

const classNames = classNames__bind.bind(__Button_css);

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames(
            'Button',
            \`color-\${color}\`,
            \`variant-\${variant}\`,
            \`size-\${size}\`,
            \`spacing-\${spacing}\`
        )}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`);
    });

    it('more css files are imported', () => {
        expect(
            inlineCssModules
                .call(
                    context,
                    Buffer.from(`
import React from 'react';
import classNames from 'classnames';
import './Input.css';
import './Button.css';
import './ButtonGroup.css';

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames(
            'Button',
            \`color-\${color}\`,
            \`variant-\${variant}\`,
            \`size-\${size}\`,
            \`spacing-\${spacing}\`
        )}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`)
                )
                ?.toString()
        ).toBe(`
import React from 'react';
import classNames__bind from 'classnames/bind';
import __Input_css from './Input.css';
import __Button_css from './Button.css';
import __ButtonGroup_css from './ButtonGroup.css';

const classNames = classNames__bind.bind({
    ...__Input_css,
    ...__Button_css,
    ...__ButtonGroup_css,
});

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames(
            'Button',
            \`color-\${color}\`,
            \`variant-\${variant}\`,
            \`size-\${size}\`,
            \`spacing-\${spacing}\`
        )}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`);
    });

    it('css file is not last import', () => {
        expect(
            inlineCssModules
                .call(
                    context,
                    Buffer.from(`
import classNames from 'classnames';
import './Button.css';
import './ButtonGroup.css';
import React from 'react';

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames(
            'Button',
            \`color-\${color}\`,
            \`variant-\${variant}\`,
            \`size-\${size}\`,
            \`spacing-\${spacing}\`
        )}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`)
                )
                ?.toString()
        ).toBe(`
import classNames__bind from 'classnames/bind';
import __Button_css from './Button.css';
import __ButtonGroup_css from './ButtonGroup.css';
import React from 'react';

const classNames = classNames__bind.bind({
    ...__Button_css,
    ...__ButtonGroup_css,
});

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames(
            'Button',
            \`color-\${color}\`,
            \`variant-\${variant}\`,
            \`size-\${size}\`,
            \`spacing-\${spacing}\`
        )}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`);
    });

    it('simple class names', () => {
        expect(
            inlineCssModules
                .call(
                    context,
                    Buffer.from(`
import React from 'react';
import classNames from 'classnames';
import './Button.css';

export function Button = (
    {
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className="Button color-neutral variant-solid size-small spacing-default"
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`)
                )
                ?.toString()
        ).toBe(`
import React from 'react';
import classNames__bind from 'classnames/bind';
import __Button_css from './Button.css';

const classNames = classNames__bind.bind(__Button_css);

export function Button = (
    {
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames('Button', 'color-neutral', 'variant-solid', 'size-small', 'spacing-default')}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`);
    });

    it.skip('wrapped string class names', () => {
        expect(
            inlineCssModules
                .call(
                    context,
                    Buffer.from(`
import React from 'react';
import classNames from 'classnames';
import './Button.css';

export function Button = (
    {
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={'Button color-neutral variant-solid size-small spacing-default'}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`)
                )
                ?.toString()
        ).toBe(`
import React from 'react';
import classNames__bind from 'classnames/bind';
import __Button_css from './Button.css';

const classNames = classNames__bind.bind(__Button_css);

export function Button = (
    {
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames('Button', 'color-neutral', 'variant-solid', 'size-small', 'spacing-default')}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`);
    });

    it.skip('template string class names', () => {
        expect(
            inlineCssModules
                .call(
                    context,
                    Buffer.from(`
import React from 'react';
import classNames from 'classnames';
import './Button.css';

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={\`Button color-\${color} variant-\${variant} size-\${size} spacing-\${spacing}\`}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`)
                )
                ?.toString()
        ).toBe(`
import React from 'react';
import classNames__bind from 'classnames/bind';
import __Button_css from './Button.css';

const classNames = classNames__bind.bind(__Button_css);

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames(\`Button\`, \`color-\${color}\`, \`variant-\${variant}\`, \`size-\${size}\`, \`spacing-\${spacing}\`)}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`);
    });

    it.skip('array class names', () => {
        expect(
            inlineCssModules
                .call(
                    context,
                    Buffer.from(`
import React from 'react';
import './Button.css';

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={['Button', \`color-\${color}\`, \`variant-\${variant}\`, \`size-\${size}\`, \`spacing-\${spacing}\`].join(' ')}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`)
                )
                ?.toString()
        ).toBe(`
import React from 'react';
import classNames__bind from 'classnames/bind';
import __Button_css from './Button.css';

const classNames = classNames__bind.bind(__Button_css);

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames('Button', \`color-\${color}\`, \`variant-\${variant}\`, \`size-\${size}\`, \`spacing-\${spacing}\`)}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`);
    });

    it('has no css imports', () => {
        expect(
            inlineCssModules
                .call(
                    context,
                    Buffer.from(`
import React from 'react';
import classNames from 'classnames';

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames(
            'Button',
            \`color-\${color}\`,
            \`variant-\${variant}\`,
            \`size-\${size}\`,
            \`spacing-\${spacing}\`
        )}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`)
                )
                ?.toString()
        ).toBe(`
import React from 'react';
import classNames from 'classnames';

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={classNames(
            'Button',
            \`color-\${color}\`,
            \`variant-\${variant}\`,
            \`size-\${size}\`,
            \`spacing-\${spacing}\`
        )}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`);
    });

    it('has no classnames import', () => {
        expect(
            inlineCssModules
                .call(
                    context,
                    Buffer.from(`
import React from 'react';
import './Button.css';

export function Button = (
    {
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className="Button color-neutral variant-solid size-small spacing-default"
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`)
                )
                ?.toString()
        ).toBe(`
import React from 'react';
import __Button_css from './Button.css';
import __classNames__bind from 'classnames/bind';

const __classNames = __classNames__bind.bind(__Button_css);

export function Button = (
    {
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        className={__classNames('Button', 'color-neutral', 'variant-solid', 'size-small', 'spacing-default')}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`);
    });

    it('has no class names used', () => {
        expect(
            inlineCssModules
                .call(
                    context,
                    Buffer.from(`
import React from 'react';
import classNames from 'classnames';
import './Button.css';

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`)
                )
                ?.toString()
        ).toBe(`
import React from 'react';
import classNames__bind from 'classnames/bind';
import __Button_css from './Button.css';

const classNames = classNames__bind.bind(__Button_css);

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`);
    });

    it('has neither classnames import nor class names used', () => {
        expect(
            inlineCssModules
                .call(
                    context,
                    Buffer.from(`
import React from 'react';
import './Button.css';

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`)
                )
                ?.toString()
        ).toBe(`
import React from 'react';
import './Button.css';

export function Button = (
    {
        color = 'neutral',
        variant = 'solid',
        size = 'small',
        spacing = 'default',
        disabled,
        ...props
    }) => (
    <button
        ref={useRef()}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
    />
);`);
    });
});
