import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Alert } from './Icons.jsx';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const show = useCallback((message, type = 'ok') => {
    clearTimeout(timer.current);
    setToast({ message, type, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [toast, show];
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div key={toast.key} role="status" className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
      <span className="tick">{toast.type === 'error' ? <Alert size={14} /> : <Check size={14} />}</span>
      {toast.message}
    </div>
  );
}
