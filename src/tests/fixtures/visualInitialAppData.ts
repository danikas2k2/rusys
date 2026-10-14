import { getVisualAppData, getVisualScenario } from './visualData';

export async function getInitialAppData(pathname: string) {
    return getVisualAppData(pathname, await getVisualScenario());
}
