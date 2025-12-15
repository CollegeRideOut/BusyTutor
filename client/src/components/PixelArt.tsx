import type { Lua_Object, Lua_Table } from '@busytutor/server/src/interpreter';
import { useState, useEffect, useMemo } from 'react';

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

export const PixelValue = ({ value }: { value: Lua_Object }) => {
  const typeColor = getTypeColor(value);
  const stringVal = useMemo(() => {
    switch (value.kind) {
      case 'null': {
        return 'null';
      }
      case 'string':
      case 'number':
      case 'boolean': {
        return String(value.value);
      }
      case 'function':
      case 'return':
      case 'error':
      case 'builtin':
      case 'table':
      case 'break':
      case 'varg': {
        return value.id;
      }
    }
  }, [value]);
  return (
    <div className='w-fit' id={`var-${name}`}>
      <PixelBox isHighlighted={false} borderColor={typeColor}>
        <span>{stringVal}</span>
      </PixelBox>
    </div>
  );
};

export const PixelVariable = ({
  name,
  value,
  opaque = false,
  equalSign = true,
  skipObj = false,
  skipName = false,
  isHighlighted = false,
}: {
  name: string;
  value: Lua_Object;
  equalSign?: boolean;
  opaque?: boolean;
  skipObj?: boolean;
  skipName?: boolean;
  isHighlighted?: boolean;
}) => {
  const typeColor = getTypeColor(value);
  const stringVal = useMemo(() => {
    switch (value.kind) {
      case 'null': {
        return 'null';
      }
      case 'string':
      case 'number':
      case 'boolean': {
        return String(value.value);
      }
      case 'function':
      case 'return':
      case 'error':
      case 'builtin':
      case 'table':
      case 'break':
      case 'varg': {
        return value.id;
      }
    }
  }, [value]);
  return (
    <div className='w-fit' id={`var-${name}`}>
      <PixelBox
        isHighlighted={isHighlighted}
        borderColor={typeColor}
        opaque={opaque}
        id={`var-${name}`}
      >
        <span>
          {!skipName ? name : null} {equalSign ? '=' : null}{' '}
          {!skipObj ? stringVal : null}
        </span>
      </PixelBox>
    </div>
  );
};

export const PixelBox = ({
  children,
  isHighlighted = false,
  borderColor,
  opaque,
  id,
}: {
  children: React.ReactNode;
  isHighlighted?: boolean;
  borderColor?: string;
  opaque?: boolean;
  id?: string;
}) => {
  const style: React.CSSProperties = {
    clipPath:
      'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
    ...(borderColor && !isHighlighted
      ? {
          borderColor: borderColor,
          backgroundColor: !opaque ? `${borderColor}15` : `black`,
        }
      : {}),
  };

  return (
    <div
      id={id}
      className={`
          inline-block border-2 p-2 font-mono text-xs pixel-container
          ${isHighlighted ? 'border-yellow-400 bg-yellow-400/20 pixel-glow reference-highlight' : ''}
          pixel-border relative transition-all duration-300
        `}
      style={style}
    >
      {children}
    </div>
  );
};

const getTypeColor = (value: Lua_Object | null): string => {
  if (!value) {
    return '#f59e0b'; // Default amber
  }
  switch (value.kind) {
    case 'string':
      return '#10b981'; // Green
    case 'number':
      return '#ef4444'; // Red
    case 'boolean':
      return '#eab308'; // Yellow
    case 'table':
      return '#14b8a6';
    case 'function':
    case 'null':
      return '#92400e'; // Brown
    case 'return':
    case 'error':
    case 'builtin':
    case 'break':
    case 'varg':
      return '#f59e0b'; // Default amber
  }
};

export const PixelTable = ({
  table,
  ref,
  highlighted,
  setHovered,
  pointerRef,
}: {
  ref: React.RefObject<Map<string, HTMLElement>>;
  table: Lua_Table;
  highlighted: Set<string>;
  setHovered: (val: [string, string]) => void;
  pointerRef: React.RefObject<Map<string, string>>;
}) => {
  let typeColor = getTypeColor(table);
  let entries = useMemo(() => {
    return [...table.store.entries()];
  }, [table]);
  return (
    <PixelBox
      isHighlighted={highlighted.has(table.id)}
      borderColor={typeColor}
      id={`variable-${table.id}`}
    >
      <div className='flex gap-2 flex-wrap w-fit items-center'>
        <div
          ref={(el) => {
            el && ref.current.set(table.id, el);
          }}
        >
          <PixelVariable
            name={''}
            equalSign={false}
            value={table}
            skipObj={true}
          />
        </div>
        {entries
          .map(([identifier, item], index) => {
            // TODO special thing for circular  dpendency / pointing to itself

            let stringIdentifier = '';
            if (typeof identifier === 'object') {
              if ('value' in identifier) {
                stringIdentifier = String(identifier.value);
              } else {
                stringIdentifier = identifier.id;
              }
            } else {
              stringIdentifier = String(identifier);
            }

            if (item.hidden) return null;
            if (item.id === table.id) return null;
            if (
              item.kind === 'table' ||
              item.kind === 'function' ||
              item.kind === 'builtin'
            ) {
              if (item.hidden) return null;
              if (item.id === table.id) return null;
              if (item.kind === 'table' && item.metatable.kind !== 'null')
                return null;
              return (
                <div
                  key={`${table.id}-${stringIdentifier}-${index}-${item.id}`}
                  onMouseEnter={() => {
                    setHovered([`${table.id}-${stringIdentifier}`, item.id]);
                  }}
                  onMouseLeave={() => {
                    setHovered(['', '']);
                  }}
                  ref={(el) => {
                    el &&
                      ref.current.set(`${table.id}-${stringIdentifier}`, el);
                    pointerRef.current.set(
                      `${table.id}-${stringIdentifier}`,
                      item.id,
                    );
                  }}
                >
                  <PixelVariable
                    name={stringIdentifier}
                    value={item}
                    equalSign={false}
                    skipObj={true}
                    isHighlighted={highlighted.has(
                      `${table.id}-${stringIdentifier}`,
                    )}
                  />
                </div>
              );
            }

            return (
              <div
                key={`${table.id}-${stringIdentifier}-${index}-${item.id}`}
                ref={(el) => {
                  //console.log(item.id, item.kind === 'number' && item.value);
                  el && ref.current.set(item.id, el);
                }}
              >
                <PixelVariable
                  name={stringIdentifier}
                  value={item}
                  skipObj={false}
                  isHighlighted={highlighted.has(item.id)}
                />
              </div>
            );
          })
          .filter((i) => i !== null)}
      </div>
    </PixelBox>
  );
};

export const PixelAssigment = ({
  names,
  values,
}: {
  names: string[];
  values: Lua_Object[];
}) => {
  let typeColor = '#c0c0c0';
  return (
    <PixelBox
      isHighlighted={false}
      borderColor={typeColor}
      id={`operation-current`}
      opaque={true}
    >
      <div className='flex gap-2 flex-wrap w-fit items-center p-8 '>
        <div
          //ref={(el) => {
          //  el && ref.current.set(table.id, el);
          //}}
          className='flex items-center justify-center gap-8'
        >
          {names.map((name, idx) => {
            return (
              <div className='flex flex-row justify-between items-center'>
                <div>{name} = </div>
                <PixelVariable
                  key={`return-${idx}-${values[idx].id}`}
                  name=''
                  skipName={true}
                  skipObj={values[idx].kind === 'table'}
                  equalSign={false}
                  value={values[idx]}
                />
              </div>
            );
          })}
        </div>
      </div>
    </PixelBox>
  );
};

export const PixelReturn = ({ values }: { values: Lua_Object[] }) => {
  let typeColor = '#c0c0c0';
  return (
    <PixelBox
      isHighlighted={false}
      borderColor={typeColor}
      id={`operation-current`}
      opaque={true}
    >
      <div className='flex gap-2 flex-wrap w-fit items-center p-8 '>
        <div
          //ref={(el) => {
          //  el && ref.current.set(table.id, el);
          //}}
          className='flex items-center justify-center gap-8'
        >
          {values.map((obj, idx) => {
            return (
              <PixelVariable
                key={`return-${idx}-${obj.id}`}
                name=''
                skipName={true}
                skipObj={obj.kind === 'table'}
                equalSign={false}
                value={obj}
              />
            );
          })}
        </div>
      </div>
    </PixelBox>
  );
};

export const PixelUnaryOperation = ({
  operation,
  arg,
  value,
}: {
  operation: string;
  arg: Lua_Object;
  value: Lua_Object;
}) => {
  let typeColor = '#c0c0c0';
  return (
    <PixelBox
      isHighlighted={false}
      borderColor={typeColor}
      id={`operation-current`}
      opaque={true}
    >
      <div className='flex gap-2 flex-wrap w-fit items-center p-8 '>
        <div
          //ref={(el) => {
          //  el && ref.current.set(table.id, el);
          //}}
          className='flex items-center justify-center gap-8'
        >
          <div>{operation}</div>
          <PixelVariable
            name={arg.name || ''}
            skipName={false}
            skipObj={true}
            equalSign={false}
            value={arg}
          />
          <div>{'-->'}</div>
          <PixelVariable
            name={''}
            skipName={true}
            equalSign={false}
            value={value}
          />
        </div>
      </div>
    </PixelBox>
  );
};

export const PixelOperation = ({
  left,
  operation,
  right,
  value,
}: {
  left: Lua_Object;
  operation: string;
  right: Lua_Object;
  value: Lua_Object;
}) => {
  let typeColor = '#c0c0c0';
  return (
    <PixelBox
      isHighlighted={false}
      borderColor={typeColor}
      id={`operation-current`}
      opaque={true}
    >
      <div className='flex gap-2 flex-wrap w-fit items-center p-8 '>
        <div
          //ref={(el) => {
          //  el && ref.current.set(table.id, el);
          //}}
          className='flex items-center justify-center gap-8'
        >
          <PixelVariable
            name={''}
            skipName={true}
            equalSign={false}
            value={left}
          />
          <div>{operation}</div>
          <PixelVariable
            name={''}
            skipName={true}
            equalSign={false}
            value={right}
          />
          <div>{'-->'}</div>
          <PixelVariable
            name={''}
            skipName={true}
            equalSign={false}
            value={value}
          />
        </div>
      </div>
    </PixelBox>
  );
};
