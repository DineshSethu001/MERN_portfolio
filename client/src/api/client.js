// Set VITE_API_URL only if the API is hosted on a different domain than the client.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details || {};
  }
}

async function request(path, { method = 'GET', body, form, signal } = {}) {
  const opts = { method, credentials: 'include', headers: {}, signal };
  if (form) opts.body = form;
  else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, opts);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Is the API running?', 0);
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) throw new ApiError(data?.error?.message || `Request failed (${res.status})`, res.status, data?.error?.details);
  return data;
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  postForm: (path, form) => request(path, { method: 'POST', form }),
  putForm: (path, form) => request(path, { method: 'PUT', form }),
  // Raw call used by the live API console, which shows status and timing.
  raw: async (path) => {
    const t0 = performance.now();
    const res = await fetch(`${BASE}/api${path}`, { credentials: 'include' });
    const ms = Math.round(performance.now() - t0);
    const json = await res.json().catch(() => null);
    return { status: res.status, statusText: res.statusText || (res.ok ? 'OK' : 'Error'), ms, json };
  },
};

export const assetUrl = (p) => (p && p.startsWith('/') ? `${BASE}${p}` : p || '');
