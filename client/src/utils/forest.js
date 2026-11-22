// Deterministic pseudo-random generator so the forest looks the same on every render.
export function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Builds an SVG path of layered pine silhouettes on a 1440×320 canvas.
export function pinePath(seed, count, minH, maxH) {
  const r = rng(seed);
  const W = 1440, base = 300;
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = (i + r() * 0.7) * (W / count);
    const h = minH + r() * (maxH - minH);
    const w = h * 0.26;
    const top = base - h;
    for (let t = 0; t < 3; t++) {
      const ty = top + t * h * 0.2;
      const tb = top + h * (0.42 + t * 0.2);
      const tw = w * (0.5 + t * 0.28);
      d += `M${(x - tw).toFixed(1)},${tb.toFixed(1)}L${x.toFixed(1)},${ty.toFixed(1)}L${(x + tw).toFixed(1)},${tb.toFixed(1)}Z`;
    }
    d += `M${(x - w * 0.07).toFixed(1)},${(top + h * 0.8).toFixed(1)}h${(w * 0.14).toFixed(1)}V${base}h${(-w * 0.14).toFixed(1)}Z`;
  }
  return `${d}M0,${base - 4}H${W}V320H0Z`;
}

export const PATHS = {
  far: pinePath(11, 64, 80, 160),
  mid: pinePath(23, 40, 120, 220),
  near: pinePath(37, 24, 170, 290),
};
