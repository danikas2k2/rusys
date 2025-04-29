export function download(data: unknown, filename = `data-${new Date().toISOString().split('T').shift()}.json`): void {
    const a = document.createElement('a');
    const objectURL = URL.createObjectURL(new Blob([JSON.stringify(data)]));
    a.href = objectURL;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectURL);
}
