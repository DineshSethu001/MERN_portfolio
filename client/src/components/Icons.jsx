// Small stroke icon set (inherits currentColor).
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const Svg = ({ size = 18, children, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>{children}</svg>;

export const Pine = (p) => <Svg {...p}><path d="M12 2 5 12h4l-3 5h12l-3-5h4L12 2Z" /><path d="M12 17v5" /></Svg>;
export const ArrowRight = (p) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
export const ArrowLeft = (p) => <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>;
export const Github = (p) => <Svg {...p}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></Svg>;
export const Lock = (p) => <Svg {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Svg>;
export const Grid = (p) => <Svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Svg>;
export const Mail = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Svg>;
export const Eye = (p) => <Svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Svg>;
export const EyeOff = (p) => <Svg {...p}><path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.9 8.3 2 12 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6" /></Svg>;
export const Logout = (p) => <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></Svg>;
export const Plus = (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const Upload = (p) => <Svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></Svg>;
export const Edit = (p) => <Svg {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Svg>;
export const Trash = (p) => <Svg {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></Svg>;
export const Star = ({ filled, ...p }) => <Svg {...p} fill={filled ? 'currentColor' : 'none'}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" /></Svg>;
export const Search = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const Check = (p) => <Svg {...p}><path d="m5 12 5 5L20 7" /></Svg>;
export const Alert = (p) => <Svg {...p}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></Svg>;
export const Up = (p) => <Svg {...p}><path d="m6 15 6-6 6 6" /></Svg>;
export const Down = (p) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>;
export const Menu = (p) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
export const Close = (p) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const Spinner = (p) => <Svg {...p} className="spin" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.2-8.56" /></Svg>;
export const External = (p) => <Svg {...p}><path d="M14 4h6v6M20 4 10 14M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" /></Svg>;
export const Sun = (p) => <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Svg>;
export const Sunset = (p) => <Svg {...p}><path d="M17 18a5 5 0 0 0-10 0M12 9V2M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1M16 5l-4 4-4-4" /></Svg>;
export const Moon = (p) => <Svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Svg>;
export function GreetingIcon({ period, ...p }) {
  if (period === 'morning' || period === 'afternoon') return <Sun className="sun" {...p} />;
  if (period === 'evening') return <Sunset {...p} />;
  return <Moon {...p} />;
}
export const Arrow28 = () => (
  <svg width="28" height="16" viewBox="0 0 28 16" {...base}><path d="M2 8h22M18 2l6 6-6 6" /></svg>
);
