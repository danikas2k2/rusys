import { labelId, messagesForLocale } from './messages';

describe('message dictionaries', () => {
    it('returns a stable numeric id for known labels and no id for unknown labels', () => {
        expect(labelId('Add')).toBe('0');
        expect(labelId('not a translated label')).toBeUndefined();
    });

    it('builds English labels and shell messages', () => {
        const messages = messagesForLocale('en-US');

        expect(messages.labels[labelId('Add')!]).toBe('Add');
        expect(messages.shell).toStrictEqual({
            switchToEnglish: 'Switch to English',
            switchToLithuanian: 'Switch to Lithuanian',
        });
    });

    it('builds Lithuanian labels and shell messages', () => {
        const messages = messagesForLocale('lt-LT');

        expect(messages.labels[labelId('Add')!]).toBe('Pridėti');
        expect(messages.shell).toStrictEqual({
            switchToEnglish: 'Perjungti į anglų kalbą',
            switchToLithuanian: 'Perjungti į lietuvių kalbą',
        });
    });
});
