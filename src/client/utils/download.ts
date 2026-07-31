export function download(blob: Blob, filename = `${new Date().toISOString().split('T').shift()}.zip`): void {
    const a = document.createElement('a');
    const objectURL = URL.createObjectURL(blob);
    a.href = objectURL;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectURL);
}
