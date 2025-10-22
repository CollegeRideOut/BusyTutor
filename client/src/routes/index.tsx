import { createFileRoute } from '@tanstack/react-router';

import {
  ArrowRight,
  Code2,
  Zap,
  BookOpen,
  Trophy,
  BarChart3,
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle,
  Badge,
  XCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  PixelArt,
  pixelPatterns,
  FloatingPixelArt,
} from '../components/PixelArt';
import { useContext, useEffect } from 'react';
import { CurrentPageContext } from './__root';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  let { setCurrentPage } = useContext(CurrentPageContext);
  useEffect(() => {
    setCurrentPage('landing');
  }, []);
  return <ElementsPage />;

  return (
    <div className='min-h-screen relative'>
      <FloatingPixelArt />

      {/* Hero Section */}
      <section className='py-32 px-4 relative z-10'>
        <div className='container mx-auto text-center'>
          <div className='max-w-5xl mx-auto'>
            <div className='flex justify-center items-center gap-6 mb-8'>
              <PixelArt pattern={pixelPatterns.code} size={12} />
              <h1 className='text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent'>
                Master Programming Fundamentals
              </h1>
              <PixelArt pattern={pixelPatterns.terminal} size={12} />
            </div>

            <div className='flex justify-center gap-4 mb-10'>
              <PixelArt pattern={pixelPatterns.function} size={8} animated />
              <PixelArt pattern={pixelPatterns.variable} size={8} />
              <PixelArt pattern={pixelPatterns.loop} size={8} animated />
            </div>

            <p className='text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed'>
              Master debugging, algorithms, data structures, and architecture
              through interactive challenges and comprehensive tutorials. Build
              your programming expertise from beginner to expert with our 8-bit
              inspired learning platform.
            </p>

            <div className='flex flex-col sm:flex-row gap-6 justify-center'>
              <Button
                size='lg'
                className='text-xl px-12 py-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105'
                onClick={async () => {}}
              >
                Start Learning
                <ArrowRight className='ml-3 h-6 w-6' />
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='text-xl px-12 py-8 border-primary/50 hover:border-primary transition-all duration-300'
              >
                View Documentation
              </Button>
            </div>

            <div className='flex justify-center mt-12'>
              <PixelArt pattern={pixelPatterns.database} size={10} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-24 px-4 bg-muted/20 relative z-10'>
        <div className='container mx-auto'>
          <div className='text-center mb-16'>
            <div className='flex justify-center items-center gap-4 mb-6'>
              <PixelArt pattern={pixelPatterns.code} size={10} />
              <h2 className='text-4xl font-bold'>Why Choose Busy Tutor?</h2>
              <PixelArt pattern={pixelPatterns.code} size={10} />
            </div>
            <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
              Our platform provides everything you need to master debugging,
              algorithms, data structures, and software architecture
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
            <Card className='p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-muted/30 border-primary/20'>
              <div className='flex items-center gap-4 mb-6'>
                <Code2 className='h-12 w-12 text-primary' />
                <PixelArt pattern={pixelPatterns.terminal} size={8} />
              </div>
              <h3 className='text-2xl font-semibold mb-4'>
                Interactive Learning
              </h3>
              <p className='text-muted-foreground text-lg leading-relaxed'>
                Practice debugging techniques, algorithm implementation, and
                architectural patterns with instant feedback
              </p>
            </Card>

            <Card className='p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-muted/30 border-secondary/20'>
              <div className='flex items-center gap-4 mb-6'>
                <Zap className='h-12 w-12 text-secondary' />
                <PixelArt pattern={pixelPatterns.function} size={8} animated />
              </div>
              <h3 className='text-2xl font-semibold mb-4'>
                Progressive Mastery
              </h3>
              <p className='text-muted-foreground text-lg leading-relaxed'>
                Start with fundamental debugging and gradually advance to
                complex algorithms and system architecture
              </p>
            </Card>

            <Card className='p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-muted/30 border-primary/20'>
              <div className='flex items-center gap-4 mb-6'>
                <BarChart3 className='h-12 w-12 text-primary' />
                <PixelArt pattern={pixelPatterns.loop} size={8} />
              </div>
              <h3 className='text-2xl font-semibold mb-4'>Skill Tracking</h3>
              <p className='text-muted-foreground text-lg leading-relaxed'>
                Monitor your progress with detailed statistics and achievement
                tracking
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Lua Section */}
      <section className='py-24 px-4 relative z-10'>
        <div className='container mx-auto'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
              <div>
                <div className='flex items-center gap-4 mb-8'>
                  <PixelArt pattern={pixelPatterns.variable} size={12} />
                  <h2 className='text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                    About Busy Tutor
                  </h2>
                </div>
                <div className='space-y-6 text-muted-foreground text-lg leading-relaxed'>
                  <p>
                    Busy Tutor is a comprehensive learning platform focused on
                    the core fundamentals of programming: debugging techniques,
                    algorithm design and analysis, data structure
                    implementation, and software architecture patterns that
                    every developer needs to master.
                  </p>
                  <p>
                    These skills are essential across all programming languages
                    and domains - from web development to systems programming,
                    from mobile apps to distributed systems. Understanding how
                    to efficiently debug code, implement optimal algorithms, and
                    design scalable architectures sets apart great developers.
                  </p>
                  <p>
                    Our comprehensive curriculum covers everything from basic
                    debugging strategies to advanced architectural patterns,
                    ensuring you gain practical skills that apply to any
                    programming environment.
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <Card className='p-6 text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 hover:scale-105 transition-transform duration-300'>
                  <div className='flex justify-center items-center gap-2 mb-3'>
                    <BookOpen className='h-10 w-10 text-primary' />
                    <PixelArt pattern={pixelPatterns.code} size={6} />
                  </div>
                  <h4 className='font-semibold text-lg'>100+ Lessons</h4>
                  <p className='text-muted-foreground'>
                    Comprehensive tutorials
                  </p>
                </Card>
                <Card className='p-6 text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 hover:scale-105 transition-transform duration-300'>
                  <div className='flex justify-center items-center gap-2 mb-3'>
                    <Trophy className='h-10 w-10 text-primary' />
                    <PixelArt
                      pattern={pixelPatterns.function}
                      size={6}
                      animated
                    />
                  </div>
                  <h4 className='font-semibold text-lg'>Achievements</h4>
                  <p className='text-muted-foreground'>Track your progress</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-24 px-4 bg-gradient-to-b from-muted/20 to-muted/40 relative z-10'>
        <div className='container mx-auto text-center'>
          <div className='flex justify-center items-center gap-6 mb-8'>
            <PixelArt pattern={pixelPatterns.loop} size={12} animated />
            <h2 className='text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
              Ready to Start Your Programming Journey?
            </h2>
            <PixelArt pattern={pixelPatterns.database} size={12} animated />
          </div>

          <p className='text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed'>
            Join thousands of developers who have mastered debugging,
            algorithms, data structures, and architecture with our interactive
            8-bit inspired platform
          </p>

          <Button
            size='lg'
            className='text-xl px-12 py-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl'
            onClick={() => onNavigate('practice')}
          >
            Start Exploring
            <ArrowRight className='ml-3 h-6 w-6' />
          </Button>
        </div>
      </section>
    </div>
  );
}
export function ElementsPage() {
  // Helper function to determine the type of a value and return appropriate color
  const getTypeColor = (value: any): string => {
    if (value === null || value === undefined) {
      return '#eab308'; // Yellow
    }
    if (typeof value === 'boolean') {
      return '#92400e'; // Brown
    }
    if (typeof value === 'string') {
      return '#10b981'; // Green
    }
    if (typeof value === 'number') {
      return '#ef4444'; // Red
    }
    if (Array.isArray(value)) {
      return '#f97316'; // Orange
    }
    if (typeof value === 'object') {
      return '#14b8a6'; // Teal
    }
    return '#f59e0b'; // Default amber
  };

  // Visualizer Components
  const PixelBox = ({
    children,
    isHighlighted = false,
    borderColor,
    id,
  }: {
    children: React.ReactNode;
    isHighlighted?: boolean;
    borderColor?: string;
    id?: string;
  }) => {
    const style: React.CSSProperties = {
      clipPath:
        'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
      ...(borderColor && !isHighlighted
        ? {
            borderColor: borderColor,
            backgroundColor: `${borderColor}15`,
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

  const PixelArray = ({
    array,
    name,
    isHighlighted = false,
  }: {
    array: any[];
    name: string;
    isHighlighted?: boolean;
  }) => {
    const arrayColor = getTypeColor(array);

    return (
      <div className='mb-4' id={`array-${name}`}>
        <div className='text-xs font-medium mb-2 text-foreground'>{name}:</div>
        <div className='flex gap-1 flex-wrap'>
          {array.map((item, index) => {
            const itemColor = getTypeColor(item);
            return (
              <PixelBox
                key={index}
                isHighlighted={isHighlighted}
                borderColor={itemColor}
                id={`${name}-${index}`}
              >
                <span>{item}</span>
              </PixelBox>
            );
          })}
        </div>
      </div>
    );
  };

   const PixelVariable = ({
    name,
    value,
    isHighlighted = false,
  }: {
    name: string;
    value: any;
    isHighlighted?: boolean;
  }) => {
    const typeColor = getTypeColor(value);

    return (
      <div className='mb-3' id={`var-${name}`}>
        <PixelBox
          isHighlighted={isHighlighted}
          borderColor={typeColor}
          id={`variable-${name}`}
        >
          <span>
            {name} = {JSON.stringify(value)}
          </span>
        </PixelBox>
      </div>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/20 text-green-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'hard':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className='min-h-screen py-12 px-4'>
      <div className='container mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-8'>
          <Button
            variant='ghost'
            className='mb-4 text-muted-foreground hover:text-foreground'
            onClick={() => onNavigate('landing')}
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Home
          </Button>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2'>
            Design Elements Library
          </h1>
          <p className='text-muted-foreground'>
            A showcase of all design components used across Busy Tutor
          </p>
        </div>

        <Tabs defaultValue='visualizer' className='w-full'>
          <TabsList className='grid w-full grid-cols-5 mb-8'>
            <TabsTrigger value='visualizer'>Visualizer</TabsTrigger>
            <TabsTrigger value='typography'>Typography</TabsTrigger>
            <TabsTrigger value='buttons'>Buttons</TabsTrigger>
            <TabsTrigger value='badges'>Badges</TabsTrigger>
            <TabsTrigger value='pixelart'>Pixel Art</TabsTrigger>
          </TabsList>

          {/* Visualizer Elements */}
          <TabsContent value='visualizer' className='space-y-8'>
            {/* Color Coding System */}
            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>
                Type Color Coding System
              </h2>
              <p className='text-sm text-muted-foreground mb-6'>
                Each data type has a unique color for easy identification
              </p>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-4 h-4 rounded border-2'
                      style={{
                        borderColor: '#ef4444',
                        backgroundColor: '#ef444415',
                      }}
                    ></div>
                    <span className='font-medium'>Number/Integer</span>
                  </div>
                  <code className='text-xs text-muted-foreground'>
                    #ef4444 (Red)
                  </code>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-4 h-4 rounded border-2'
                      style={{
                        borderColor: '#10b981',
                        backgroundColor: '#10b98115',
                      }}
                    ></div>
                    <span className='font-medium'>String</span>
                  </div>
                  <code className='text-xs text-muted-foreground'>
                    #10b981 (Green)
                  </code>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-4 h-4 rounded border-2'
                      style={{
                        borderColor: '#92400e',
                        backgroundColor: '#92400e15',
                      }}
                    ></div>
                    <span className='font-medium'>Boolean</span>
                  </div>
                  <code className='text-xs text-muted-foreground'>
                    #92400e (Brown)
                  </code>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-4 h-4 rounded border-2'
                      style={{
                        borderColor: '#f97316',
                        backgroundColor: '#f9731615',
                      }}
                    ></div>
                    <span className='font-medium'>Array</span>
                  </div>
                  <code className='text-xs text-muted-foreground'>
                    #f97316 (Orange)
                  </code>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-4 h-4 rounded border-2'
                      style={{
                        borderColor: '#eab308',
                        backgroundColor: '#eab30815',
                      }}
                    ></div>
                    <span className='font-medium'>Null/Undefined</span>
                  </div>
                  <code className='text-xs text-muted-foreground'>
                    #eab308 (Yellow)
                  </code>
                </div>
              </div>
            </Card>

            {/* Arrow Components */}
            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Arrow Components</h2>
              <p className='text-sm text-muted-foreground mb-6'>
                Visual indicators for pointers, access, and assignments in the
                visualizer
              </p>

              <div className='space-y-8'>
                {/* Arrowheads */}
                <div>
                  <h3 className='text-sm font-medium mb-4 text-muted-foreground'>
                    Arrowheads
                  </h3>
                  <div className='flex flex-wrap items-center gap-8'>
                    <div className='flex flex-col items-center gap-2'>
                      <svg width='40' height='40' viewBox='0 0 40 40'>
                        <defs>
                          <marker
                            id='arrowhead-primary'
                            markerWidth='10'
                            markerHeight='10'
                            refX='8'
                            refY='4'
                            orient='auto'
                            markerUnits='strokeWidth'
                          >
                            <path d='M0,0 L0,8 L8,4 Z' fill='#4c6ef5' />
                          </marker>
                        </defs>
                        <line
                          x1='5'
                          y1='20'
                          x2='30'
                          y2='20'
                          stroke='#4c6ef5'
                          strokeWidth='2'
                          markerEnd='url(#arrowhead-primary)'
                        />
                      </svg>
                      <span className='text-xs text-muted-foreground'>
                        Primary
                      </span>
                      <code className='text-xs text-muted-foreground'>
                        #4c6ef5
                      </code>
                    </div>

                    <div className='flex flex-col items-center gap-2'>
                      <svg width='40' height='40' viewBox='0 0 40 40'>
                        <defs>
                          <marker
                            id='arrowhead-secondary'
                            markerWidth='10'
                            markerHeight='10'
                            refX='8'
                            refY='4'
                            orient='auto'
                            markerUnits='strokeWidth'
                          >
                            <path d='M0,0 L0,8 L8,4 Z' fill='#6c5ce7' />
                          </marker>
                        </defs>
                        <line
                          x1='5'
                          y1='20'
                          x2='30'
                          y2='20'
                          stroke='#6c5ce7'
                          strokeWidth='2'
                          markerEnd='url(#arrowhead-secondary)'
                        />
                      </svg>
                      <span className='text-xs text-muted-foreground'>
                        Secondary
                      </span>
                      <code className='text-xs text-muted-foreground'>
                        #6c5ce7
                      </code>
                    </div>

                    <div className='flex flex-col items-center gap-2'>
                      <svg width='40' height='40' viewBox='0 0 40 40'>
                        <defs>
                          <marker
                            id='arrowhead-accent'
                            markerWidth='10'
                            markerHeight='10'
                            refX='8'
                            refY='4'
                            orient='auto'
                            markerUnits='strokeWidth'
                          >
                            <path d='M0,0 L0,8 L8,4 Z' fill='#f59e0b' />
                          </marker>
                        </defs>
                        <line
                          x1='5'
                          y1='20'
                          x2='30'
                          y2='20'
                          stroke='#f59e0b'
                          strokeWidth='2'
                          markerEnd='url(#arrowhead-accent)'
                        />
                      </svg>
                      <span className='text-xs text-muted-foreground'>
                        Accent
                      </span>
                      <code className='text-xs text-muted-foreground'>
                        #f59e0b
                      </code>
                    </div>
                  </div>
                </div>

                {/* Line Styles */}
                <div>
                  <h3 className='text-sm font-medium mb-4 text-muted-foreground'>
                    Line Styles
                  </h3>
                  <div className='space-y-6'>
                    {/* Solid Line */}
                    <div className='flex items-center gap-4'>
                      <svg width='150' height='40' viewBox='0 0 150 40'>
                        <line
                          x1='10'
                          y1='20'
                          x2='140'
                          y2='20'
                          stroke='#4c6ef5'
                          strokeWidth='3'
                        />
                      </svg>
                      <div>
                        <p className='font-medium'>Solid Line</p>
                        <code className='text-xs text-muted-foreground'>
                          strokeWidth: 3
                        </code>
                        <p className='text-xs text-muted-foreground'>
                          Used for: Access
                        </p>
                      </div>
                    </div>

                    {/* Dashed Line (Pointer) */}
                    <div className='flex items-center gap-4'>
                      <svg width='150' height='40' viewBox='0 0 150 40'>
                        <line
                          x1='10'
                          y1='20'
                          x2='140'
                          y2='20'
                          stroke='#6c5ce7'
                          strokeWidth='2'
                          strokeDasharray='4,4'
                        />
                      </svg>
                      <div>
                        <p className='font-medium'>Dashed Line (Short)</p>
                        <code className='text-xs text-muted-foreground'>
                          strokeDasharray: 4,4
                        </code>
                        <p className='text-xs text-muted-foreground'>
                          Used for: Pointer
                        </p>
                      </div>
                    </div>

                    {/* Dashed Line (Assignment) */}
                    <div className='flex items-center gap-4'>
                      <svg width='150' height='40' viewBox='0 0 150 40'>
                        <line
                          x1='10'
                          y1='20'
                          x2='140'
                          y2='20'
                          stroke='#f59e0b'
                          strokeWidth='2'
                          strokeDasharray='6,3'
                        />
                      </svg>
                      <div>
                        <p className='font-medium'>Dashed Line (Long)</p>
                        <code className='text-xs text-muted-foreground'>
                          strokeDasharray: 6,3
                        </code>
                        <p className='text-xs text-muted-foreground'>
                          Used for: Assignment
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complete Arrows */}
                <div>
                  <h3 className='text-sm font-medium mb-4 text-muted-foreground'>
                    Complete Arrow Types
                  </h3>
                  <div className='space-y-6'>
                    {/* Access Arrow */}
                    <div className='flex items-center gap-4'>
                      <svg width='150' height='40' viewBox='0 0 150 40'>
                        <defs>
                          <marker
                            id='complete-primary'
                            markerWidth='10'
                            markerHeight='10'
                            refX='8'
                            refY='4'
                            orient='auto'
                            markerUnits='strokeWidth'
                          >
                            <path d='M0,0 L0,8 L8,4 Z' fill='#4c6ef5' />
                          </marker>
                        </defs>
                        <line
                          x1='10'
                          y1='20'
                          x2='140'
                          y2='20'
                          stroke='#4c6ef5'
                          strokeWidth='3'
                          markerEnd='url(#complete-primary)'
                        />
                      </svg>
                      <div>
                        <p className='font-medium text-primary'>Access Arrow</p>
                        <code className='text-xs text-muted-foreground'>
                          Solid line + Arrowhead
                        </code>
                      </div>
                    </div>

                    {/* Pointer Arrow */}
                    <div className='flex items-center gap-4'>
                      <svg width='150' height='40' viewBox='0 0 150 40'>
                        <defs>
                          <marker
                            id='complete-secondary'
                            markerWidth='10'
                            markerHeight='10'
                            refX='8'
                            refY='4'
                            orient='auto'
                            markerUnits='strokeWidth'
                          >
                            <path d='M0,0 L0,8 L8,4 Z' fill='#6c5ce7' />
                          </marker>
                        </defs>
                        <line
                          x1='10'
                          y1='20'
                          x2='140'
                          y2='20'
                          stroke='#6c5ce7'
                          strokeWidth='2'
                          strokeDasharray='4,4'
                          markerEnd='url(#complete-secondary)'
                        />
                      </svg>
                      <div>
                        <p className='font-medium text-secondary'>
                          Pointer Arrow
                        </p>
                        <code className='text-xs text-muted-foreground'>
                          Dashed line (4,4) + Arrowhead
                        </code>
                      </div>
                    </div>

                    {/* Assignment Arrow */}
                    <div className='flex items-center gap-4'>
                      <svg width='150' height='40' viewBox='0 0 150 40'>
                        <defs>
                          <marker
                            id='complete-accent'
                            markerWidth='10'
                            markerHeight='10'
                            refX='8'
                            refY='4'
                            orient='auto'
                            markerUnits='strokeWidth'
                          >
                            <path d='M0,0 L0,8 L8,4 Z' fill='#f59e0b' />
                          </marker>
                        </defs>
                        <line
                          x1='10'
                          y1='20'
                          x2='140'
                          y2='20'
                          stroke='#f59e0b'
                          strokeWidth='2'
                          strokeDasharray='6,3'
                          markerEnd='url(#complete-accent)'
                        />
                      </svg>
                      <div>
                        <p className='font-medium' style={{ color: '#f59e0b' }}>
                          Assignment Arrow
                        </p>
                        <code className='text-xs text-muted-foreground'>
                          Dashed line (6,3) + Arrowhead
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* PixelVariable Examples */}
            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Pixel Variables</h2>
              <p className='text-sm text-muted-foreground mb-6'>
                Variables displayed in 8-bit styled boxes with type-based color
                coding
              </p>
              <div className='space-y-4'>
                <div>
                  <h3 className='text-sm font-medium mb-2 text-muted-foreground'>
                    Normal State
                  </h3>
                  <PixelVariable name='count' value={42} />
                  <PixelVariable name='name' value='Alice' />
                  <PixelVariable name='isActive' value={true} />
                  <PixelVariable name='score' value={null} />
                </div>
                <div>
                  <h3 className='text-sm font-medium mb-2 text-muted-foreground'>
                    Highlighted State
                  </h3>
                  <PixelVariable
                    name='currentNum'
                    value={7}
                    isHighlighted={true}
                  />
                </div>
              </div>
            </Card>

            {/* PixelArray Examples */}
            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Pixel Arrays</h2>
              <p className='text-sm text-muted-foreground mb-6'>
                Arrays with individual elements color-coded by their type
              </p>
              <div className='space-y-4'>
                <div>
                  <h3 className='text-sm font-medium mb-2 text-muted-foreground'>
                    Normal State
                  </h3>
                  <PixelArray name='nums' array={[1, 2, 3, 1]} />
                  <PixelArray name='seen' array={[1, 2, 3]} />
                  <PixelArray name='words' array={['hello', 'world']} />
                  <PixelArray name='mixed' array={[1, 'test', true]} />
                </div>
                <div>
                  <h3 className='text-sm font-medium mb-2 text-muted-foreground'>
                    Highlighted State
                  </h3>
                  <PixelArray
                    name='target'
                    array={[5, 10, 15]}
                    isHighlighted={true}
                  />
                </div>
              </div>
            </Card>

            {/* PixelBox Examples */}
            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Pixel Boxes</h2>
              <p className='text-sm text-muted-foreground mb-6'>
                Base component with 8-bit clipped corners
              </p>
              <div className='flex flex-wrap gap-4'>
                <PixelBox borderColor='#ef4444'>Number Box</PixelBox>
                <PixelBox borderColor='#10b981'>String Box</PixelBox>
                <PixelBox borderColor='#92400e'>Boolean Box</PixelBox>
                <PixelBox borderColor='#f97316'>Array Box</PixelBox>
                <PixelBox isHighlighted={true}>Highlighted Box</PixelBox>
              </div>
            </Card>
          </TabsContent>

          {/* Typography */}
          <TabsContent value='typography' className='space-y-8'>
            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Typography Scale</h2>
              <div className='space-y-4'>
                <div>
                  <h1>Heading 1 - The quick brown fox</h1>
                  <code className='text-xs text-muted-foreground'>
                    h1 - text-2xl, font-medium
                  </code>
                </div>
                <div>
                  <h2>Heading 2 - The quick brown fox</h2>
                  <code className='text-xs text-muted-foreground'>
                    h2 - text-xl, font-medium
                  </code>
                </div>
                <div>
                  <h3>Heading 3 - The quick brown fox</h3>
                  <code className='text-xs text-muted-foreground'>
                    h3 - text-lg, font-medium
                  </code>
                </div>
                <div>
                  <h4>Heading 4 - The quick brown fox</h4>
                  <code className='text-xs text-muted-foreground'>
                    h4 - text-base, font-medium
                  </code>
                </div>
                <div>
                  <p>Paragraph - The quick brown fox jumps over the lazy dog</p>
                  <code className='text-xs text-muted-foreground'>
                    p - text-base, font-normal
                  </code>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Colors</h2>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div>
                  <div
                    className='w-full h-20 rounded-lg'
                    style={{ backgroundColor: '#4c6ef5' }}
                  ></div>
                  <p className='mt-2 font-medium'>Primary</p>
                  <code className='text-xs text-muted-foreground'>#4c6ef5</code>
                </div>
                <div>
                  <div
                    className='w-full h-20 rounded-lg'
                    style={{ backgroundColor: '#6c5ce7' }}
                  ></div>
                  <p className='mt-2 font-medium'>Secondary</p>
                  <code className='text-xs text-muted-foreground'>#6c5ce7</code>
                </div>
                <div>
                  <div
                    className='w-full h-20 rounded-lg'
                    style={{ backgroundColor: '#1a1a1a' }}
                  ></div>
                  <p className='mt-2 font-medium'>Background</p>
                  <code className='text-xs text-muted-foreground'>#1a1a1a</code>
                </div>
                <div>
                  <div
                    className='w-full h-20 rounded-lg'
                    style={{ backgroundColor: '#242424' }}
                  ></div>
                  <p className='mt-2 font-medium'>Card</p>
                  <code className='text-xs text-muted-foreground'>#242424</code>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Buttons */}
          <TabsContent value='buttons' className='space-y-8'>
            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Button Variants</h2>
              <div className='flex flex-wrap gap-4'>
                <Button>Default</Button>
                <Button variant='outline'>Outline</Button>
                <Button variant='ghost'>Ghost</Button>
                <Button variant='link'>Link</Button>
                <Button variant='destructive'>Destructive</Button>
                <Button variant='secondary'>Secondary</Button>
              </div>
            </Card>

            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Button Sizes</h2>
              <div className='flex flex-wrap items-center gap-4'>
                <Button size='sm'>Small</Button>
                <Button>Default</Button>
                <Button size='lg'>Large</Button>
              </div>
            </Card>

            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Button with Icons</h2>
              <div className='flex flex-wrap gap-4'>
                <Button>
                  <Play className='h-4 w-4 mr-2' />
                  Run Code
                </Button>
                <Button variant='outline'>
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Reset
                </Button>
                <Button variant='ghost'>
                  <CheckCircle className='h-4 w-4 mr-2' />
                  Passed
                </Button>
              </div>
            </Card>

            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>
                Gradient Buttons (Used in Auth)
              </h2>
              <div className='flex flex-wrap gap-4'>
                <Button className='bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'>
                  Create Account
                </Button>
                <Button className='bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'>
                  Sign In
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Badges */}
          <TabsContent value='badges' className='space-y-8'>
            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Difficulty Badges</h2>
              <div className='flex flex-wrap gap-4'>
                <Badge
                  variant='secondary'
                  className={getDifficultyColor('easy')}
                >
                  Easy
                </Badge>
                <Badge
                  variant='secondary'
                  className={getDifficultyColor('medium')}
                >
                  Medium
                </Badge>
                <Badge
                  variant='secondary'
                  className={getDifficultyColor('hard')}
                >
                  Hard
                </Badge>
              </div>
            </Card>

            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Badge Variants</h2>
              <div className='flex flex-wrap gap-4'>
                <Badge>Default</Badge>
                <Badge variant='secondary'>Secondary</Badge>
                <Badge variant='outline'>Outline</Badge>
                <Badge variant='destructive'>Destructive</Badge>
              </div>
            </Card>

            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Status Indicators</h2>
              <div className='flex flex-wrap gap-4 items-center'>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-3 bg-yellow-400 rounded-full animate-pulse' />
                  <span>Running</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-3 w-3 text-green-400' />
                  <span>Passed</span>
                </div>
                <div className='flex items-center gap-2'>
                  <XCircle className='h-3 w-3 text-red-400' />
                  <span>Failed</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Pixel Art */}
          <TabsContent value='pixelart' className='space-y-8'>
            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>8-Bit Pixel Art Icons</h2>
              <p className='text-sm text-muted-foreground mb-6'>
                Custom pixel art components used throughout the site
              </p>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
                <div className='flex flex-col items-center gap-2'>
                  <PixelArt pattern={pixelPatterns.code} size={10} />
                  <span className='text-xs text-muted-foreground'>Code</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <PixelArt pattern={pixelPatterns.terminal} size={10} />
                  <span className='text-xs text-muted-foreground'>
                    Terminal
                  </span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <PixelArt pattern={pixelPatterns.function} size={10} />
                  <span className='text-xs text-muted-foreground'>
                    Function
                  </span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <PixelArt pattern={pixelPatterns.database} size={10} />
                  <span className='text-xs text-muted-foreground'>
                    Database
                  </span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <PixelArt pattern={pixelPatterns.variable} size={10} />
                  <span className='text-xs text-muted-foreground'>
                    Variable
                  </span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <PixelArt pattern={pixelPatterns.loop} size={10} />
                  <span className='text-xs text-muted-foreground'>Loop</span>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Form Elements</h2>
              <div className='space-y-4 max-w-md'>
                <div>
                  <label className='block mb-2'>Input Field</label>
                  <Input placeholder='Enter text...' />
                </div>
                <div>
                  <label className='block mb-2'>Textarea</label>
                  <Textarea placeholder='Enter multi-line text...' rows={3} />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
