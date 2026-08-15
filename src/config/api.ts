// Configuration helper for API Base URL across Vite frontend deployments
// Automatically uses relative path in same-origin environments (like AI Studio preview & unified fullstack)
// and uses external backend URL when running on a separate host (like Netlify frontend -> Render backend)

const rawEnvApiUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').trim();

function resolveBaseUrl(): string {
  if (!rawEnvApiUrl) return '';

  // If in browser and current window host is the local preview or same origin, prefer relative URL
  if (typeof window !== 'undefined') {
    try {
      const parsed = new URL(rawEnvApiUrl);
      // If we are running in AI Studio preview or localhost, use relative to avoid cross-origin timeouts if Render is spinning up
      if (window.location.hostname.includes('run.app') || window.location.hostname.includes('localhost')) {
        return '';
      }
    } catch (e) {
      // ignore
    }
  }

  return rawEnvApiUrl.replace(/\/+$/, '');
}

export const API_BASE_URL = resolveBaseUrl();

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export default API_BASE_URL;
