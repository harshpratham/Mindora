import { functionsBaseUrl, functionsNamespace } from './apiConfig';

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${functionsBaseUrl}/${functionsNamespace}/${normalizedPath}`;
}

export async function authedPost<TBody>(path: string, token: string, body: TBody): Promise<Response> {
  return fetch(buildApiUrl(path), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
