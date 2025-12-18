import fs from 'node:fs';

import { JSDOM } from 'jsdom';
import type { HtmlTagDescriptor } from 'vite';

function getTag(el: Element, injectTo: 'head' | 'body'): HtmlTagDescriptor {
    const tag = el.localName;
    const attrs: Record<string, string | boolean> = {};
    for (const attr of el.attributes) {
        // HTML boolean attributes can appear as empty string in DOM.
        attrs[attr.name] = attr.value === '' ? true : attr.value;
    }

    const children = el.innerHTML?.trim();
    return children ? { injectTo, tag, attrs, children } : { injectTo, tag, attrs };
}

function getKey(tag: HtmlTagDescriptor): string {
    const url = new URL(`${tag.injectTo}://${tag.tag}`);
    for (const [key, value] of Object.entries(tag.attrs || {})) {
        url.searchParams.set(key, String(value));
    }
    return url.toString();
}

function getTags(elements: HTMLCollection, injectTo: 'head' | 'body'): Map<string, HtmlTagDescriptor> {
    const tags = new Map<string, HtmlTagDescriptor>();

    for (const el of elements) {
        const tag = getTag(el, injectTo);
        tags.set(getKey(tag), tag);
    }

    return tags;
}

export function getTagMap(file: string): Map<string, HtmlTagDescriptor> {
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
    return new Map<string, HtmlTagDescriptor>([
        ...getTags(dom.window.document.head.children, 'head'),
        ...getTags(dom.window.document.body.children, 'body'),
    ]);
}
