import { describe, expect, it, vi } from 'vitest';
import { authedPost, buildApiUrl } from './api';

describe('api utils', () => {
  it('builds namespaced function URL', () => {
    expect(buildApiUrl('/health')).toContain('/make-server-c6b9db5d/health');
  });

  it('posts authenticated payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);
    await authedPost('profile', 'token-123', { name: 'Mindora' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
