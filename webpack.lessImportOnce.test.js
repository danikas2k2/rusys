// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lessImportOnce, { reset } from 'webpack.lessImportOnce';

describe('webpack.lessImportOnce', () => {
    beforeAll(reset);
    afterEach(reset);

    it('without import', () => {
        expect(
            lessImportOnce(`
.Button { font-weight: bold; }
`)
        ).toEqual(`
.Button { font-weight: bold; }
`);
    });

    it('with simple import', () => {
        expect(
            lessImportOnce(`
@import 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import 'button.less';
.Button { font-weight: bold; }
`);
    });

    it('with duplicate simple imports', () => {
        expect(
            lessImportOnce(`
@import 'button.less';
@import 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import 'button.less';
@import 'button.less';
.Button { font-weight: bold; }
`);
    });

    it('with simple imports in separate files', () => {
        expect(
            lessImportOnce(`
@import 'input.less';
@import 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import 'input.less';
@import 'button.less';
.Button { font-weight: bold; }
`);
        expect(
            lessImportOnce(`
@import 'input.less';
@import 'checkbox.less';
.Checkbox { border: 1px solid black; }
`)
        ).toEqual(`
@import 'input.less';
@import 'checkbox.less';
.Checkbox { border: 1px solid black; }
`);
    });

    it('with (once) import', () => {
        expect(
            lessImportOnce(`
@import (once) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (once) 'button.less';
.Button { font-weight: bold; }
`);
    });

    it('with duplicate (once) imports', () => {
        expect(
            lessImportOnce(`
@import (once) 'button.less';
@import (once) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (once) 'button.less';
.Button { font-weight: bold; }
`);
    });

    it('with (once) imports in separate files', () => {
        expect(
            lessImportOnce(`
@import (once) 'input.less';
@import (once) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (once) 'input.less';
@import (once) 'button.less';
.Button { font-weight: bold; }
`);
        expect(
            lessImportOnce(`
@import (once) 'input.less';
@import (once) 'checkbox.less';
.Checkbox { border: 1px solid black; }
`)
        ).toEqual(`
@import (once) 'checkbox.less';
.Checkbox { border: 1px solid black; }
`);
    });

    it('with duplicate (css) imports', () => {
        expect(
            lessImportOnce(`
@import (css) 'button.less';
@import (css) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (css) 'button.less';
@import (css) 'button.less';
.Button { font-weight: bold; }
`);
    });

    it('with duplicate (css,once) imports', () => {
        expect(
            lessImportOnce(`
@import (css,once) 'button.less';
@import (css,once) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (css,once) 'button.less';
.Button { font-weight: bold; }
`);
    });

    it('with duplicate (once,css) imports', () => {
        expect(
            lessImportOnce(`
@import (once,css) 'button.less';
@import (once,css) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (once,css) 'button.less';
.Button { font-weight: bold; }
`);
    });

    it('with duplicate (css,reference) imports', () => {
        expect(
            lessImportOnce(`
@import (css,reference) 'button.less';
@import (css,reference) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (css,reference) 'button.less';
@import (css,reference) 'button.less';
.Button { font-weight: bold; }
`);
    });

    it('with duplicate (css,once,reference) imports', () => {
        expect(
            lessImportOnce(`
@import (css,once,reference) 'button.less';
@import (css,once,reference) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (css,once,reference) 'button.less';
.Button { font-weight: bold; }
`);
    });

    it('with duplicate (*,once,*) imports', () => {
        expect(
            lessImportOnce(`
@import (css,once,reference) 'button.less';
@import (reference,css,once) 'button.less';
@import (once,reference,css) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (css,once,reference) 'button.less';
.Button { font-weight: bold; }
`);
    });

    it('with double quotes', () => {
        expect(
            lessImportOnce(`
@import (once) "button.less";
@import (once) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (once) "button.less";
.Button { font-weight: bold; }
`);
    });

    it('with url', () => {
        expect(
            lessImportOnce(`
@import (once) url(button.less);
@import (once) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (once) url(button.less);
.Button { font-weight: bold; }
`);
    });

    it('with url and single quotes', () => {
        expect(
            lessImportOnce(`
@import (once) url('button.less');
@import (once) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (once) url('button.less');
.Button { font-weight: bold; }
`);
    });

    it('with url and double quotes', () => {
        expect(
            lessImportOnce(`
@import (once) url("button.less");
@import (once) 'button.less';
.Button { font-weight: bold; }
`)
        ).toEqual(`
@import (once) url("button.less");
.Button { font-weight: bold; }
`);
    });
});
