import { Link } from 'react-router-dom';
import ForestBackground from '../components/ForestBackground.jsx';
import Treeline from '../components/Treeline.jsx';

export default function NotFound() {
  return (
    <>
      <ForestBackground />
      <main className="center-screen" style={{ flexDirection: 'column', gap: 18, textAlign: 'center', padding: '24px 24px 260px' }}>
        <span className="eyebrow fu">GET {typeof window !== 'undefined' ? window.location.pathname : ''} → 404</span>
        <h1 className="h1 fu d1">Lost in the woods.</h1>
        <p className="lead fu d2">This trail doesn't lead anywhere.</p>
        <Link to="/" className="btn btn-primary fu d3">Back to camp</Link>
        <Treeline />
      </main>
    </>
  );
}
