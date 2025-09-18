import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { Code2, Menu, Github, Twitter, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState } from 'react';

//context
export const Route = createRootRoute({
  component: () => {
    const [currentPage, setCurrentPage] = useState<'landing' | 'practice'>(
      'landing',
    );

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          textDecoration: 'none',
          fontSize: 18,
        }}
      >
        <Header
          currentPage={currentPage}
          onNavigate={(e: string) => setCurrentPage(e as any)}
        />
        <Outlet />
        <Footer />
      </div>
    );
  },
});
interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}
export function Header({ currentPage, onNavigate }: HeaderProps) {
  return (
    <header className='border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div
            className='flex items-center gap-2 cursor-pointer'
            onClick={() => onNavigate('landing')}
          >
            <Code2 className='h-8 w-8 text-primary' />
            <span className='text-xl font-semibold'>Busy Tutor</span>
          </div>

          <nav className='hidden md:flex items-center gap-6'>
            <Link
              to='/'
              className={`hover:text-primary transition-colors ${
                currentPage === 'landing'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => onNavigate('landing')}
            >
              Home
            </Link>

            <Link
              to='/practice'
              className={`hover:text-primary transition-colors ${
                currentPage === 'practice'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => onNavigate('practice')}
            >
              Practice
            </Link>

            <Button variant='outline'>Login</Button>
            <Button variant='outline'>Register</Button>
            <Button>Get Started</Button>
          </nav>

          <Button variant='ghost' size='sm' className='md:hidden'>
            <Menu className='h-5 w-5' />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className='bg-muted/30 border-t mt-auto'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Code2 className='h-6 w-6 text-primary' />
              <span className='text-lg font-semibold'>Busy Tutor</span>
            </div>
            <p className='text-muted-foreground text-sm'>
              Master debugging, algorithms, data structures, and architecture
              through interactive challenges and comprehensive learning
              resources.
            </p>
          </div>

          <div>
            <h3 className='font-semibold mb-4'>Learn</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Getting Started
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Debugging Basics
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Advanced Architecture
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Best Practices
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='font-semibold mb-4'>Practice</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Algorithms
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Data Structures
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Debugging
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Architecture
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='font-semibold mb-4'>Connect</h3>
            <div className='flex gap-4'>
              <Github className='h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors' />
              <Twitter className='h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors' />
              <Mail className='h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors' />
            </div>
          </div>
        </div>

        <div className='border-t pt-8 mt-8 text-center text-sm text-muted-foreground'>
          © 2024 Busy Tutor. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
