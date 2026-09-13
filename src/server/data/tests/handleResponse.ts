export function mockResponse() {
    const response = {
        end: vi.fn(),
        json: vi.fn(),
        location: vi.fn(),
        send: vi.fn(),
        setHeader: vi.fn(),
        status: vi.fn(),
    };
    response.status.mockReturnValue(response);
    response.location.mockReturnValue(response);
    return response;
}
