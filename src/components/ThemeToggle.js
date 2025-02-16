'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  const [animate, setAnimate] = useState(false);
  const [waveCoords, setWaveCoords] = useState(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = (e) => {
    setWaveCoords({ x: e.clientX, y: e.clientY });
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
      setWaveCoords(null);
    }, 800);

    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  };

  return (
    <div className="relative inline-block">
      <Button onClick={toggleTheme} className="relative z-10 flex items-center gap-2">
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </Button>
      {animate && waveCoords && (
        <div className="wave-overlay">
          <span className="wave" style={{ left: waveCoords.x, top: waveCoords.y }}></span>
        </div>
      )}
    </div>
  );
}
