import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { site } from '../data/site.js';

const ENDPOINTS = [
  { method: 'GET', path: '/profile' },
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/projects?limit=2' },
];

// Flattens JSON into coloured lines. Long string lists collapse onto one line.
function toLines(val, indent = 0, key = null, last = true, out = []) {
  const pad = '  '.repeat(indent);
  const k = key !== null ? JSON.stringify(key) + ': ' : '';
  const tail = last ? '' : ',';
  if (Array.isArray(val) && val.every((x) => typeof x !== 'object' || x === null) && JSON.stringify(val).length < 70) {
    out.push({ pad, k, v: JSON.stringify(val).replace(/","/g, '", "'), cls: 'j-str', tail });
  } else if (val && typeof val === 'object') {
    const isArr = Array.isArray(val);
    const entries = isArr ? val.map((v) => [null, v]) : Object.entries(val);
    out.push({ pad, k, v: isArr ? '[' : '{', cls: 'j-punct', tail: '' });
    entries.forEach(([kk, vv], i) => toLines(vv, indent + 1, kk, i === entries.length - 1, out));
    out.push({ pad, k: '', v: isArr ? ']' : '}', cls: 'j-punct', tail });
  } else {
    const cls = typeof val === 'string' ? 'j-str' : typeof val === 'number' ? 'j-num' : 'j-bool';
    let v = JSON.stringify(val);
    if (typeof val === 'string' && v.length > 60) v = v.slice(0, 57) + '…"';
    out.push({ pad, k, v, cls, tail });
  }
  return out;
}

// Trim heavy fields so the console stays readable.
function compact(json) {
  if (json?.data && Array.isArray(json.data)) {
    return { ...json, data: json.data.map(({ title, category, tags }) => ({ title, category, tags })) };
  }
  return json;
}

export default function ApiConsole() {
  const [active, setActive] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (i) => {
    setActive(i);
    setLoading(true);
    try {
      const r = await api.raw(ENDPOINTS[i].path);
      setResult({ ...r, json: compact(r.json), key: Date.now() });
    } catch {
      setResult({ status: 0, statusText: 'Network error', ms: 0, json: { error: 'API is not reachable — start the server with `npm run dev`.' }, key: Date.now() });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { run(0); }, [run]);

  const ep = ENDPOINTS[active];
  const lines = result ? toLines(result.json ?? null) : [];
  const ok = result && result.status >= 200 && result.status < 300;

  return (
    <div className="console floaty">
      <div className="console-bar">
        <div className="lights"><span /><span /><span /></div>
        <span>live api-console — click an endpoint</span>
        <span style={{ width: 52 }} />
      </div>
      <div className="endpoints">
        {ENDPOINTS.map((e, i) => (
          <button key={e.path} type="button" className="endpoint" aria-pressed={active === i} onClick={() => run(i)}>
            <span className="method">{e.method}</span>
            <span>/api{e.path}</span>
          </button>
        ))}
      </div>
      <div className="console-body" aria-live="polite">
        <div className="console-cmd">
          <span className="accent">$</span> curl {site.apiDomain ? `https://${site.apiDomain}` : window.location.origin}/api{ep.path}
          <span className="caret accent"> ▍</span>
        </div>
        <div className="console-meta">
          {loading || !result ? (
            <span>requesting…</span>
          ) : (
            <>
              <span className={`status-code ${ok ? '' : 'err'}`}>{result.status || 'ERR'} {result.statusText}</span>
              <span>application/json</span>
              <span>{result.ms} ms</span>
            </>
          )}
        </div>
        <div className="json" key={result?.key}>
          {lines.map((l, i) => (
            <div key={i} className="json-line" style={{ animationDelay: `${i * 30}ms` }}>
              {l.pad}<span className="j-key">{l.k}</span><span className={l.cls}>{l.v}</span><span className="j-punct">{l.tail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
