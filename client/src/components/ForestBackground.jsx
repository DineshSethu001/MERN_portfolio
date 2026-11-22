import { useMemo } from 'react';
import { rng } from '../utils/forest.js';

const LEAF_COLORS = ['#3F7A4A', '#5E9C4F', '#8A6A2E', '#B07C2F'];

// Fixed layer of drifting fireflies and falling leaves behind every page.
export default function ForestBackground({ fireflies = 34, leaves = 12 }) {
  const { flies, falling } = useMemo(() => {
    const r = rng(7);
    const flies = Array.from({ length: fireflies }, (_, i) => {
      const size = 2.5 + r() * 3;
      return {
        left: `${(r() * 100).toFixed(1)}%`,
        top: `${(8 + r() * 88).toFixed(1)}%`,
        width: size,
        height: size,
        animation: `ff${i % 3} ${(10 + r() * 14).toFixed(1)}s ease-in-out ${(-r() * 20).toFixed(1)}s infinite, blink ${(2.5 + r() * 3).toFixed(1)}s ease-in-out ${(-r() * 5).toFixed(1)}s infinite`,
      };
    });
    const falling = Array.from({ length: leaves }, (_, i) => ({
      size: Math.round(12 + r() * 10),
      color: LEAF_COLORS[i % LEAF_COLORS.length],
      style: { left: `${(5 + r() * 95).toFixed(1)}%`, animation: `fall ${(16 + r() * 14).toFixed(1)}s linear ${(-r() * 30).toFixed(1)}s infinite` },
    }));
    return { flies, falling };
  }, [fireflies, leaves]);

  return (
    <div className="ambient" aria-hidden="true">
      {flies.map((style, i) => <span key={i} className="firefly" style={style} />)}
      {falling.map((l, i) => (
        <span key={`l${i}`} className="leaf" style={l.style}>
          <svg width={l.size} height={l.size} viewBox="0 0 24 24">
            <path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15Z" fill={l.color} />
            <path d="M5 19 14 10" stroke="#07130D" strokeWidth="1.2" fill="none" />
          </svg>
        </span>
      ))}
    </div>
  );
}
