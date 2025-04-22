import { type FunctionComponent } from 'react';
import ButtonArticle from '~/tutorial/articles/Button.mdx';
import CheckboxArticle from '~/tutorial/articles/Checkbox.mdx';
import ColorsArticle from '~/tutorial/articles/Colors.mdx';
import FileArticle from '~/tutorial/articles/File.mdx';
import InputArticle from '~/tutorial/articles/Input.mdx';
import MenuArticle from '~/tutorial/articles/Menu.mdx';
import SelectArticle from '~/tutorial/articles/Select.mdx';

export const PAGES: Record<string, [string, FunctionComponent]> = {
    colors: ['Colors', ColorsArticle],
    button: ['Button', ButtonArticle],
    checkbox: ['Checkbox', CheckboxArticle],
    input: ['Input', InputArticle],
    file: ['File', FileArticle],
    select: ['Select', SelectArticle],
    menu: ['Menu', MenuArticle],
};
