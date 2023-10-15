import useSetStateFromResponse from '~/store/base/useSetStateFromResponse';

export default function useInitialLoader(): (onLoad?: () => void) => Promise<void> {
    const updateState = useSetStateFromResponse();
    return async (): Promise<void> => updateState(await fetch('/load'));
}
