import { createFileRoute } from '@tanstack/react-router';

import { ArrowRight, Code2, Zap, BookOpen, Trophy, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { PixelArt, pixelPatterns, FloatingPixelArt } from '../components/PixelArt';



export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
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
                onClick={() => onNavigate('practice')}
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
