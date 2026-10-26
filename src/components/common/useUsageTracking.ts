import { useEffect, useRef } from 'react';

import type { FaroEventAttributes } from '~/lib/observability/events';
import { trackFaroEvent } from '~/lib/observability/faro';

type Dialog = NonNullable<FaroEventAttributes<'dialog_opened'>['dialog']>;
type Form = NonNullable<FaroEventAttributes<'form_submitted'>['form']>;
type Field = NonNullable<FaroEventAttributes<'form_field_changed'>['field']>;

export function useDialogTracking(dialog: Dialog, opened: boolean): void {
    const state = useRef({ opened: false, generation: 0 });
    useEffect(() => {
        const current = state.current;
        current.generation += 1;
        if (current.opened !== opened) {
            trackFaroEvent(opened ? 'dialog_opened' : 'dialog_closed', { dialog });
            current.opened = opened;
        }
        const generation = current.generation;
        return () => {
            queueMicrotask(() => {
                if (current.generation === generation && current.opened) {
                    trackFaroEvent('dialog_closed', { dialog });
                    current.opened = false;
                }
            });
        };
    }, [dialog, opened]);
}

/** Track a completed dirty field once per dialog session; never inspect its value. */
export function useFormTracking(form: Form, opened = true) {
    const completed = useRef(new Set<Field>());
    useEffect(() => {
        if (!opened) {
            completed.current.clear();
        }
    }, [opened]);
    return {
        field: (field: Field, dirty: boolean) => {
            if (dirty && !completed.current.has(field)) {
                completed.current.add(field);
                trackFaroEvent('form_field_changed', { form, field });
            }
        },
    };
}
