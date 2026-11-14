import { dropImageAction } from '~/server/actions/images';
import { requireSession } from '~/server/auth/session';
import { dropStagedImage } from '~/server/data/stagedImages';

vi.mock(import('~/server/auth/session'));
vi.mock(import('~/server/data/stagedImages'));

describe('drop image action', () => {
    beforeEach(() => {
        vi.mocked(requireSession).mockResolvedValue({ email: 'owner' } as Awaited<ReturnType<typeof requireSession>>);
    });

    afterEach(() => vi.resetAllMocks());

    it('uses the authenticated owner to discard the token', async () => {
        await dropImageAction('upload:token');

        expect(dropStagedImage).toHaveBeenCalledExactlyOnceWith('upload:token', 'owner');
    });

    it.each([undefined, ''])('does not delete files for a profile without an email (%s)', async (email) => {
        vi.mocked(requireSession).mockResolvedValue({ email } as Awaited<ReturnType<typeof requireSession>>);
        await dropImageAction('upload:token');

        expect(dropStagedImage).not.toHaveBeenCalled();
    });

    it('rejects malformed action arguments without touching storage', async () => {
        await dropImageAction(42 as never);

        expect(dropStagedImage).not.toHaveBeenCalled();
    });

    it('requires authentication before deleting anything', async () => {
        vi.mocked(requireSession).mockRejectedValue(new Error('Unauthorized'));

        await expect(dropImageAction('upload:token')).rejects.toThrow('Unauthorized');
        expect(dropStagedImage).not.toHaveBeenCalled();
    });
});
