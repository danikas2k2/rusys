import { type FunctionComponent } from 'react';

import ButtonArticle from '@ui/tutorial/articles/Button';
import CheckboxArticle from '@ui/tutorial/articles/Checkbox';
import ColorsArticle from '@ui/tutorial/articles/Colors';
import FileArticle from '@ui/tutorial/articles/File';
import InputArticle from '@ui/tutorial/articles/Input';
import MenuArticle from '@ui/tutorial/articles/Menu';
import SelectArticle from '@ui/tutorial/articles/Select';

export const PAGES: Record<string, [string, FunctionComponent]> = {
    colors: ['Colors', ColorsArticle],
    button: ['Button', ButtonArticle],
    checkbox: ['Checkbox', CheckboxArticle],
    input: ['Input', InputArticle],
    file: ['File', FileArticle],
    select: ['Select', SelectArticle],
    menu: ['Menu', MenuArticle],
};
