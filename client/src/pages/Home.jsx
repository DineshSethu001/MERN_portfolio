import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ForestBackground from '../components/ForestBackground.jsx';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/sections/Hero.jsx';
import { MernStrip, Stack, Architecture } from '../components/sections/Skills.jsx';
import Projects from '../components/sections/Projects.jsx';
import Contact from '../components/sections/Contact.jsx';

export default function Home() {
  const { hash } = useLocation();
  // Scroll to #section when arriving from another page (e.g. /#projects).
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
      <ForestBackground />
      <div className="page">
        <Navbar />
        <main>
          <Hero />
          <MernStrip />
          <Stack />
          <Architecture />
          <Projects />
        </main>
        <Contact />
      </div>
    </>
  );
}
