import { type FunctionComponent } from 'react';
import ButtonArticle from '~/tutorial/articles/Button';
import CheckboxArticle from '~/tutorial/articles/Checkbox';
import ColorsArticle from '~/tutorial/articles/Colors';
import FileArticle from '~/tutorial/articles/File';
import InputArticle from '~/tutorial/articles/Input';
import MenuArticle from '~/tutorial/articles/Menu';
import SelectArticle from '~/tutorial/articles/Select';

export const PAGES: Record<string, [string, FunctionComponent]> = {
    colors: ['Colors', ColorsArticle],
    button: ['Button', ButtonArticle],
    checkbox: ['Checkbox', CheckboxArticle],
    input: ['Input', InputArticle],
    file: ['File', FileArticle],
    select: ['Select', SelectArticle],
    menu: ['Menu', MenuArticle],
};
