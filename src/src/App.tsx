import { useRef, useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { LoadingScreen } from './components/LoadingScreen';
import { Home } from './sections/Home';
import { About } from './sections/About';
import { Experience } from './sections/Experience';
import { Skills } from './sections/Skills';
import { Portfolio } from './sections/Portfolio';
import { Certifications } from './sections/Certifications';
import { Contact } from './sections/Contact';

function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [themeMode, setThemeMode] = useState<'auto' | 'day' | 'night'>('auto');
  const [autoNightMode, setAutoNightMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Calculate effective night mode
  const isNightMode = themeMode === 'auto' ? autoNightMode : themeMode === 'night';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleNightMode = (source: 'manual' | 'auto' = 'manual') => {
    if (source === 'manual') {
      // Cycle: Auto -> Day -> Night -> Auto
      setThemeMode(prev => {
        if (prev === 'auto') return 'day';
        if (prev === 'day') return 'night';
        return 'auto';
      });
    } else if (source === 'auto') {
      setAutoNightMode(prev => !prev);
    }
  };

  return (
    <div className={`relative w-screen h-[100dvh] overflow-hidden transition-colors duration-500 ${isNightMode ? 'bg-[#0a0a2a]' : 'bg-sky-300'}`}>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Game Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <GameCanvas
          contentRef={contentRef}
          isNightMode={isNightMode}
          onToggleNightMode={toggleNightMode}
          themeMode={themeMode}
        />
      </div>

      {/* Content Layer */}
      <div
        ref={contentRef}
        className="flex h-full will-change-transform"
        style={{
          width: isMobile ? 'calc(800vw + 175vw)' : '800vw', // 7 gaps * 25vw = 175vw
          gap: isMobile ? '25vw' : '0'
        }}
      >
        <Home isNightMode={isNightMode} />
        <About isNightMode={isNightMode} />
        <Experience isNightMode={isNightMode} />
        <Portfolio isNightMode={isNightMode} />
        <Skills isNightMode={isNightMode} />
        <Certifications isNightMode={isNightMode} />
        <Contact isNightMode={isNightMode} />
        <Home isNightMode={isNightMode} /> {/* Duplicate for seamless loop */}
      </div>
    </div>
  );
}

export default App;
