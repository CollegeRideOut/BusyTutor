import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
} from '@tanstack/react-router';
import { Code2, Menu, Github, Twitter, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import { trpc } from '../lib/trpc';

//context
export let CurrentPageContext = createContext({
  page: 'landing',
  setCurrentPage: (p: string) => {
    void p;
  },
});
type AuthContextType = {
  user: { email: string; id: string } | null;
  token: string | null;
  login: (user: { email: string; password: string }) => Promise<boolean>;
  register: (user: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  let navigate = useNavigate();
  let loginMuation = trpc.user.login.useMutation();
  let registerMuation = trpc.user.register.useMutation();

  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  let { data, error } = trpc.user.userInfo.useQuery(undefined, {
    enabled: false,
    refetchInterval: 200,
  });

  // load from localStorage once
  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
  }, []);

  useEffect(() => {
    console.log(data);
    if (!token && (!!user || !!token)) {
      logout();
    }
    if (token && (!data?.success || !!error)) {
      logout();
    }
  }, [data, error]);

  const login = async (user: {
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      let u = await loginMuation.mutateAsync({
        email: user.email,
        password: user.password,
      });

      if (!u.success) throw Error('Login unsucesful');
      setUser({ email: u.user.email, id: u.user.email });
      setToken(u.token);
      localStorage.setItem('token', u.token);
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (e) {
      console.log(e);
      logout();
      return false;
    }

    //localStorage.setItem('token', token);
    //localStorage.setItem('user', JSON.stringify(user));
  };

  const register = async (user: {
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      let u = await registerMuation.mutateAsync({
        email: user.email,
        password: user.password,
      });
      if (!u.success) throw Error('Register unsuccesfull');
      setUser({ email: u.user.email, id: u.user.email });
      setToken(u.token);
      localStorage.setItem('token', u.token);
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (e) {
      console.log(e);
      logout();
      return false;
    }

    //localStorage.setItem('token', token);
    //localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate({ to: '/' });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const Route = createRootRoute({
  component: () => {
    const [currentPage, setCurrentPage] = useState<
      'landing' | 'practice' | 'problem' | 'register' | 'login'
    >('landing');
    return (
      <div className='min-h-screen flex flex-col flex-1 bg-background'>
        <AuthProvider>
          {currentPage !== 'problem' && (
            <Header
              currentPage={currentPage}
              onNavigate={(e: string) => setCurrentPage(e as any)}
            />
          )}

          <CurrentPageContext.Provider
            value={{
              page: currentPage,
              setCurrentPage: setCurrentPage as any,
            }}
          >
            <main className='flex flex-col flex-1'>
              <Outlet />
            </main>
          </CurrentPageContext.Provider>

          {currentPage !== 'problem' && <Footer />}
        </AuthProvider>
      </div>
    );
  },
});
interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}
export function Header({ currentPage, onNavigate }: HeaderProps) {
  let navigate = useNavigate();
  let auth = useAuth();
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

            {auth.user === null ? (
              <>
                <Button
                  variant={currentPage === 'login' ? 'default' : 'outline'}
                  onClick={() => {
                    navigate({ to: '/login' });
                  }}
                >
                  Login
                </Button>

                <Button
                  variant={currentPage === 'register' ? 'default' : 'outline'}
                  onClick={() => {
                    navigate({ to: '/register' });
                  }}
                >
                  Register
                </Button>
              </>
            ) : (
              <div> {auth.user.email}</div>
            )}

            {auth.user !== null && (
              <Button
                onClick={() => {
                  auth.logout();
                  //navigate({ to: '/' });
                }}
              >
                Log Out
              </Button>
            )}
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
