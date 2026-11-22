import { useEffect, useState } from 'react';

// Greeting based on the VISITOR's local clock, refreshed every minute.
export function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return { text: 'Good morning', period: 'morning', note: 'Fresh coffee, fresh deploys.' };
  if (h >= 12 && h < 17) return { text: 'Good afternoon', period: 'afternoon', note: 'Hope your builds are green today.' };
  if (h >= 17 && h < 21) return { text: 'Good evening', period: 'evening', note: 'Perfect time to browse some backends.' };
  return { text: 'Hello, night owl', period: 'night', note: 'The fireflies are out — and so are you.' };
}

export function useGreeting() {
  const [greeting, setGreeting] = useState(() => greetingFor());
  useEffect(() => {
    const id = setInterval(() => {
      const next = greetingFor();
      setGreeting((g) => (g.text === next.text ? g : next));
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return greeting;
}
