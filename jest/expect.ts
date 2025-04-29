import { matcherHint, printDiffOrStringify, printReceived } from 'jest-matcher-utils';

// import { toHaveAttribute } from '@testing-library/jest-dom/matchers';
// import { aria, roles } from 'aria-query';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        // noinspection JSUnusedGlobalSymbols
        interface Matchers<R> {
            toHaveListWithTextContent(expected: string[]): R;

            toBeExpanded(): R;

            toBeCollapsed(): R;

            toBeSelected(): R;
        }

        interface Expect {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            event(type: Event['type'], props?: object): any;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type
            element<P = object>(type: Function, props?: Partial<P>): any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            element<P = object>(type: string, props?: Partial<P>): any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            element<P = object>(props: Partial<P>): any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            element(): any;
        }
    }
}

expect.extend({
    // TODO add html element check
    toHaveListWithTextContent(this: jest.MatcherUtils, elements: HTMLElement[], expected: string[]) {
        const received = elements.map((e) => e.textContent);
        const pass = expected.length === received.length && expected.every((e, i) => e === received[i]);
        return {
            pass,
            message: () =>
                [
                    `${matcherHint(`${this.isNot ? '.not' : ''}.toHaveListWithTextContent`, 'elements', 'expected')}`,
                    '',
                    ...(this.isNot
                        ? [`Expected elements not to have content:`, `${printReceived(received)}`]
                        : [`${printDiffOrStringify(expected, received, 'Expected', 'Received', true)}`]),
                ].join('\n'),
        };
    },

    // TODO add html element check
    // TODO add role check for aria-expanded
    toBeExpanded(this: jest.MatcherUtils, element: HTMLElement) {
        const isExpanded = element.getAttribute('aria-expanded') === 'true';
        return {
            pass: isExpanded,
            message: () =>
                [
                    this.utils.matcherHint(`${this.isNot ? '.not' : ''}.toBeExpanded`, 'element', ''),
                    '',
                    `Received element ${isExpanded ? 'is' : 'is not'} expanded:`,
                    `  ${this.utils.printReceived(element.cloneNode(false))}`,
                ].join('\n'),
        };
    },

    // TODO add html element check
    // TODO add role check for aria-expanded
    toBeCollapsed(this: jest.MatcherUtils, element: HTMLElement) {
        const isCollapsed = element.getAttribute('aria-expanded') !== 'true';
        return {
            pass: isCollapsed,
            message: () =>
                [
                    this.utils.matcherHint(`${this.isNot ? '.not' : ''}.toBeCollapsed`, 'element', ''),
                    '',
                    `Received element ${isCollapsed ? 'is' : 'is not'} collapsed:`,
                    `  ${this.utils.printReceived(element.cloneNode(false))}`,
                ].join('\n'),
        };
    },

    // TODO add html element check
    // TODO add role check for aria-selected
    toBeSelected(this: jest.MatcherUtils, element: HTMLElement) {
        const isSelected = element.getAttribute('aria-selected') === 'true';
        return {
            pass: isSelected,
            message: () =>
                [
                    this.utils.matcherHint(`${this.isNot ? '.not' : ''}.toBeSelected`, 'element', ''),
                    '',
                    `Received element ${isSelected ? 'is' : 'is not'} selected:`,
                    `  ${this.utils.printReceived(element.cloneNode(false))}`,
                ].join('\n'),
        };
    },
});

Object.defineProperties(expect, {
    event: {
        writable: true,
        value: (type: Event['type'], props?: object) => expect.objectContaining({ type, ...props }),
    },
    element: {
        writable: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        value: (type?: string | Function | object, props?: object) => {
            const element = {
                $$typeof: expect.any(Symbol),
            };

            switch (typeof type) {
                case 'undefined':
                    return expect.objectContaining(element);

                case 'function':
                case 'string':
                    const typedElement = {
                        ...element,
                        type,
                    };
                    return props
                        ? expect.objectContaining({
                              ...typedElement,
                              props: expect.objectContaining({ ...props }),
                          })
                        : expect.objectContaining(typedElement);

                default:
                    return expect.objectContaining({ ...element, props: expect.objectContaining({ ...type }) });
            }
        },
    },
});

/*

import {roles} from 'aria-query'
import {checkHtmlElement, toSentence} from './utils'

export function toBeChecked(element) {
  checkHtmlElement(element, toBeChecked, this)

  const isValidInput = () => {
    return (
      element.tagName.toLowerCase() === 'input' &&
      ['checkbox', 'radio'].includes(element.type)
    )
  }

  const isValidAriaElement = () => {
    return (
      roleSupportsChecked(element.getAttribute('role')) &&
      ['true', 'false'].includes(element.getAttribute('aria-checked'))
    )
  }

  if (!isValidInput() && !isValidAriaElement()) {
    return {
      pass: false,
      message: () =>
        `only inputs with type="checkbox" or type="radio" or elements with ${supportedRolesSentence()} and a valid aria-checked attribute can be used with .toBeChecked(). Use .toHaveValue() instead`,
    }
  }

  const isChecked = () => {
    if (isValidInput()) return element.checked
    return element.getAttribute('aria-checked') === 'true'
  }

  return {
    pass: isChecked(),
    message: () => {
      const is = isChecked() ? 'is' : 'is not'
      return [
        this.utils.matcherHint(
          `${this.isNot ? '.not' : ''}.toBeChecked`,
          'element',
          '',
        ),
        '',
        `Received element ${is} checked:`,
        `  ${this.utils.printReceived(element.cloneNode(false))}`,
      ].join('\n')
    },
  }
}

function supportedRolesSentence() {
  return toSentence(
    supportedRoles().map(role => `role="${role}"`),
    {lastWordConnector: ' or '},
  )
}

function supportedRoles() {
  return roles.keys().filter(roleSupportsChecked)
}

function roleSupportsChecked(role) {
  return roles.get(role)?.props['aria-checked'] !== undefined
}

*/
