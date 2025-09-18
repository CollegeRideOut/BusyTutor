import { useState, useEffect } from 'react';

interface PixelArtProps {
  pattern: number[][];
  size?: number;
  className?: string;
  colors?: string[];
  animated?: boolean;
}

export function PixelArt({
  pattern,
  size = 8,
  className = '',
  colors = ['#4c6ef5', '#6c5ce7'],
  animated = false,
}: PixelArtProps) {
  //TODO
  void animated;
  const [isHovered, setIsHovered] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (!isSpinning) return;

    const interval = setInterval(() => {
      setAnimationFrame((prev) => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, [isSpinning]);

  const handleClick = () => {
    setIsSpinning(!isSpinning);
  };

  const getPixelColor = (value: number) => {
    if (value === 0) return 'transparent';
    if (value === 1) return colors[0];
    if (value === 2) return colors[1];
    return '#2d2d2d';
  };

  return (
    <div
      className={`inline-block cursor-pointer transition-transform duration-200 ${isHovered ? 'scale-110' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        filter: isHovered
          ? 'drop-shadow(0 0 8px rgba(76, 110, 245, 0.6))'
          : 'none',
      }}
    >
      <div
        className='grid gap-px'
        style={{
          gridTemplateColumns: `repeat(${pattern[0]?.length || 8}, 1fr)`,
          transform: isSpinning ? `rotate(${animationFrame * 90}deg)` : 'none',
          transition: 'transform 0.3s ease',
        }}
      >
        {pattern.map((row, rowIndex) =>
          row.map((pixel, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className='transition-colors duration-200'
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: getPixelColor(pixel),
                border:
                  pixel !== 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}
            />
          )),
        )}
      </div>
    </div>
  );
}

// Predefined pixel art patterns
export const pixelPatterns = {
  code: [
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 0, 0, 1, 1, 0],
  ],

  terminal: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 2, 2, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],

  function: [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 0],
    [0, 0, 0, 0, 0, 0, 2, 0],
    [0, 0, 0, 2, 2, 2, 0, 0],
  ],

  variable: [
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
  ],

  loop: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 2, 2, 0, 0, 1],
    [1, 0, 2, 0, 0, 2, 0, 1],
    [1, 0, 2, 0, 0, 2, 0, 1],
    [1, 0, 0, 2, 2, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ],

  database: [
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ],
};

export function FloatingPixelArt({ className = '' }: { className?: string }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const patterns = Object.values(pixelPatterns);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {patterns.map((pattern, index) => (
        <div
          key={index}
          className='absolute pointer-events-auto'
          style={{
            left: `${10 + index * 15}%`,
            top: `${20 + index * 12}%`,
            transform: `translateY(${scrollY * (0.1 + index * 0.05)}px)`,
            opacity: 0.1 + index * 0.02,
          }}
        >
          <PixelArt
            pattern={pattern}
            size={6}
            animated={false}
            colors={
              index % 2 === 0 ? ['#4c6ef5', '#6c5ce7'] : ['#6c5ce7', '#4c6ef5']
            }
          />
        </div>
      ))}
    </div>
  );
}
