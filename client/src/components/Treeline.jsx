import { PATHS } from '../utils/forest.js';

// Layered pine silhouettes with drifting fog. Place inside a position:relative section.
export default function Treeline({ height = 340, layers = 3, baseColor = '#07130D' }) {
  return (
    <div className="treeline" style={{ height }} aria-hidden="true">
      <svg className="sway-slow" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" style={{ bottom: 70, height: 260 }}>
        <path d={PATHS.far} fill="#12301F" />
      </svg>
      <div className="fog slow" style={{ bottom: 120, height: 140 }} />
      {layers > 2 && (
        <svg className="sway" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" style={{ bottom: 30, height: 290 }}>
          <path d={PATHS.mid} fill="#0C2216" />
        </svg>
      )}
      <div className="fog" style={{ bottom: 40, height: 160 }} />
      <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" style={{ bottom: 0, height: 300 }}>
        <path d={layers > 2 ? PATHS.near : PATHS.mid} fill={baseColor} />
      </svg>
    </div>
  );
}
