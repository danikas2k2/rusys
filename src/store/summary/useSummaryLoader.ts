import useSetStateFromResponse from '~/store/base/useSetStateFromResponse';

export default function useSummaryLoader(): (onLoad?: () => void) => Promise<void> {
    const updateState = useSetStateFromResponse();
    return async (): Promise<void> => updateState(await fetch('/summary'));
}
