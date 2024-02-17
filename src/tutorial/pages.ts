import { type FunctionComponent } from 'react';
import ButtonArticle from '~/tutorial/articles/Button.mdx';
import CheckboxArticle from '~/tutorial/articles/Checkbox.mdx';
import ColorsArticle from '~/tutorial/articles/Colors.mdx';
import InputArticle from '~/tutorial/articles/Input.mdx';
import LabeledInputArticle from '~/tutorial/articles/LabeledInput.mdx';
import MenuArticle from '~/tutorial/articles/Menu.mdx';

export const PAGES: Record<string, [string, FunctionComponent]> = {
    colors: ['Colors', ColorsArticle],
    button: ['Button', ButtonArticle],
    checkbox: ['Checkbox', CheckboxArticle],
    Input: ['Input', InputArticle],
    LabeledInput: ['LabeledInput', LabeledInputArticle],
    Menu: ['Menu', MenuArticle],
};
