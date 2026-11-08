export class RecycleRefreshError extends Error {
    constructor() {
        super('Recycled successfully, but refresh failed');
    }
}
