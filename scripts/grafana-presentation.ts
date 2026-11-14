// Group panels without changing titles, queries, series names or alert deep links.
type Panel = Record<string, unknown>;
interface Group {
    title: string;
    ids: number[];
}
const groups: Record<string, Group[]> = {
    'rusys-infrastructure': [
        { title: 'NAS · Synology host metrics', ids: [2, 3, 7, 8] },
        { title: 'Docker · Container metrics', ids: [4, 5, 6, 9, 10] },
        { title: 'Alloy · Metrics collection', ids: [11] },
    ],
    'rusys-application': [
        { title: 'NGINX · Traffic and API responses', ids: [2, 3, 4, 5, 6, 7] },
        { title: 'Application · Server errors', ids: [8] },
        { title: 'MongoDB · Database metrics', ids: [9, 10, 11] },
        { title: 'Tempo · Backend traces', ids: [12, 13] },
    ],
    'rusys-frontend-usage': [
        { title: 'Faro · Usage events', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
        { title: 'Faro · Browser errors and performance', ids: [18, 19, 21, 22, 20] },
    ],
};

export function presentDashboard<T extends { uid: string; title: string; panels: Panel[]; links: { title: string }[] }>(
    dashboard: T
): T {
    const sections = groups[dashboard.uid];
    if (!sections) {
        return dashboard;
    }
    const panels = dashboard.panels;
    const organized: Panel[] = panels.filter((panel) => panel.id === 1);
    let y = 4;
    sections.forEach((section, index) => {
        organized.push({
            id: 100 + index,
            title: section.title,
            type: 'row',
            collapsed: false,
            gridPos: { x: 0, y, w: 24, h: 1 },
            panels: [],
        });
        y++;
        section.ids.forEach((id, position) => {
            const panel = panels.find((candidate) => candidate.id === id);
            if (!panel) {
                throw new Error(`Missing panel ${id} in ${dashboard.uid}`);
            }
            organized.push({
                ...panel,
                gridPos: { x: (position % 2) * 12, y: y + Math.floor(position / 2) * 8, w: 12, h: 8 },
            });
        });
        y += Math.ceil(section.ids.length / 2) * 8;
    });
    if (organized.filter((panel) => panel.type !== 'row').length !== panels.length) {
        throw new Error(`Ungrouped panels in ${dashboard.uid}`);
    }
    dashboard.panels = organized;
    return dashboard;
}
