import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

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
    if (tag.children) {
        url.hash = createHash('sha256').update(`${tag.children}`, 'utf8').digest('hex');
    }
    console.info(`[DEV]`, 'Generated tag key:', url.toString());
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

export function parseTemplate(file: string): Map<string, HtmlTagDescriptor> {
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
    const head = getTags(dom.window.document.head.children, 'head');
    const body = getTags(dom.window.document.body.children, 'body');
    return new Map<string, HtmlTagDescriptor>([...head, ...body]);
}

export function injectTags(...tags: Map<string, HtmlTagDescriptor>[]): HtmlTagDescriptor[] {
    const tagz = Array.from(new Map(...tags).values());
    console.info(`[DEV]`, tags);
    return tagz;
}
