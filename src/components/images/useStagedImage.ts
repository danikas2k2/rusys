import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { SchemaError } from '~/schema';
import { dropImageAction } from '~/server/actions/images';

/** Owns an upload until the server action claims it or the editor is closed. */
export function useStagedImage(opened: boolean, onChange: (image: string) => void) {
    const current = useRef<string | undefined>(undefined);
    const generation = useRef(0);
    const active = useRef(opened);
    useLayoutEffect(() => {
        active.current = opened;
        return () => {
            active.current = false;
        };
    }, [opened]);
    const change = useRef(onChange);
    useLayoutEffect(() => {
        change.current = onChange;
    });
    const [preview, setPreview] = useState<string>();
    const [progress, setProgress] = useState<number>();
    const [reading, setReading] = useState(false);
    const dispose = useCallback(() => {
        generation.current++;
        const token = current.current;
        current.current = undefined;
        if (token) {
            void dropImageAction(token).catch(() => undefined);
        }
    }, []);
    useEffect(() => {
        if (!opened) {
            dispose();
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset the editor when its modal closes.
            setProgress(undefined);
            setPreview(undefined);
            setReading(false);
        }
        const pagehide = () => {
            if (current.current) {
                navigator.sendBeacon(
                    '/api/images',
                    new Blob([JSON.stringify({ drop: current.current })], { type: 'application/json' })
                );
            }
            dispose();
        };
        window.addEventListener('pagehide', pagehide);
        return () => {
            window.removeEventListener('pagehide', pagehide);
            dispose();
        };
    }, [opened, dispose]);
    const drop = useCallback(
        async (dataUrl: string) => {
            if (!active.current) {
                return;
            }
            generation.current++;
            const previousToken = current.current;
            const previousPreview = preview;
            const attempt = generation.current;
            setPreview(dataUrl);
            setProgress(0);
            let token: string | undefined;
            try {
                await uploadWithProgress(
                    'POST',
                    '/api/images',
                    JSON.stringify({ image: dataUrl }),
                    (value) => {
                        if (attempt === generation.current) {
                            setProgress(value);
                        }
                    },
                    (body) => {
                        const result: unknown = JSON.parse(body);
                        if (
                            !result ||
                            typeof result !== 'object' ||
                            !('token' in result) ||
                            typeof result.token !== 'string' ||
                            !/^upload:[a-f0-9]{64}$/.test(result.token)
                        ) {
                            throw new Error(SchemaError.UploadFailed);
                        }
                        token = result.token;
                    }
                );
                if (!token) {
                    throw new Error(SchemaError.UploadFailed);
                }
                if (attempt !== generation.current || !active.current) {
                    await dropImageAction(token);
                    return;
                }
                current.current = token;
                if (previousToken) {
                    void dropImageAction(previousToken).catch(() => undefined);
                }
                change.current(token);
                return token;
            } catch (error) {
                if (attempt === generation.current) {
                    setPreview(previousPreview);
                }
                throw error;
            } finally {
                if (attempt === generation.current) {
                    setProgress(undefined);
                }
            }
        },
        [preview]
    );
    const remove = useCallback(() => {
        dispose();
        setPreview(undefined);
        setProgress(undefined);
        change.current('');
    }, [dispose]);
    return { drop, remove, preview, progress, busy: reading || progress !== undefined, setReading };
}
