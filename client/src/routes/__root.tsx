import { FaGoogle } from 'react-icons/fa';
import { TbLogout } from 'react-icons/tb';
import {
  createRootRoute,
  Outlet,
  useNavigate,
  useRouterState,
  Link,
} from '@tanstack/react-router';
import { Code2, Menu, Github, Twitter, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useEffect, useState, createContext, useContext } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

// ---------------- AUTH CONTEXT ----------------
export type AuthContextType = {
  user: {
    id: string;
    email: string;
    displayName: string;
    profilePicUrl: string;
  } | null;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);
const API_URL = 'http://localhost:3000';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  //const navigate = useNavigate();
  const [user, setUser] = useState<AuthContextType['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/me`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('not authenticated');
        return res.json();
      })
      .then((data) => {
        setUser({
          id: data.user.user.id,
          email: data.user.user.email,
          displayName: data.user.user.displayName,
          profilePicUrl: data.user.user.profilePicUrl,
        });
      })
      .catch(() => {
        //navigate({ to: '/' });
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    await fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

// ---------------- ROOT ROUTE ----------------
export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const { location } = useRouterState();
  const path = location.pathname;

  // derive the page name based on the path
  const currentPage = path.startsWith('/practice')
    ? 'practice'
    : path.startsWith('/problem')
      ? 'problem'
      : path.startsWith('/register')
        ? 'register'
        : path.startsWith('/login')
          ? 'login'
          : path.startsWith('/admin')
            ? 'admin'
            : 'landing';

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <AuthProvider>
        {currentPage !== 'problem' && <Header currentPage={currentPage} />}
        <main className='flex flex-col flex-1'>
          <Outlet />
        </main>
        {currentPage !== 'problem' && <Footer />}
      </AuthProvider>
    </div>
  );
}

// ---------------- HEADER ----------------
export function Header({ currentPage }: { currentPage: string }) {
  const navigate = useNavigate();
  const auth = useAuth();

  return (
    <header className='border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div
            className='flex items-center gap-2 cursor-pointer'
            onClick={() => navigate({ to: '/' })}
          >
            <Code2 className='h-8 w-8 text-primary' />
            <span className='text-xl font-semibold'>Busy Tutor</span>
          </div>

          <nav className='hidden md:flex items-center gap-6'>
            {auth.user !== null && (
              <Link
                to='/practice'
                className={`hover:text-primary transition-colors ${
                  currentPage === 'practice'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                Practice
              </Link>
            )}

            <>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  {auth.user === null ? (
                    'Sign In'
                  ) : (
                    <img
                      src={auth.user.profilePicUrl}
                      className='w-6 h-6 rounded-full'
                    />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className='flex flex-col gap-y-2 w-[300px] p-2'>
                  <DropdownMenuLabel className='flex  gap-y-2 items-center gap-x-2'>
                    {auth.user === null ? (
                      'Sign In'
                    ) : (
                      <>
                        <FaGoogle /> {auth.user.displayName}
                      </>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className='bg-white' />
                  {auth.user === null ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          window.location.href = `http://localhost:3000/api/auth/google`;
                        }}
                      >
                        <FaGoogle /> Google
                      </DropdownMenuItem>
                      {/*<DropdownMenuItem>Github</DropdownMenuItem>*/}
                      <DropdownMenuSeparator className='bg-white' />
                      <DropdownMenuItem className='text-wrap'>
                        By signing in, you agree to BusyTutor's terms of service
                        and privacy policy.
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => {
                        //   window.location.href = `http://localhost:3000/api/auth/google`;
                        auth.logout();
                      }}
                    >
                      <TbLogout /> Sign Out
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          </nav>

          <Button variant='ghost' size='sm' className='md:hidden'>
            <Menu className='h-5 w-5' />
          </Button>
        </div>
      </div>
    </header>
  );
}

// ---------------- FOOTER ----------------
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
                <a href='#' className='hover:text-primary'>
                  Getting Started
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary'>
                  Debugging Basics
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary'>
                  Advanced Architecture
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary'>
                  Best Practices
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='font-semibold mb-4'>Practice</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <a href='#' className='hover:text-primary'>
                  Algorithms
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary'>
                  Data Structures
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary'>
                  Debugging
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary'>
                  Architecture
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='font-semibold mb-4'>Connect</h3>
            <div className='flex gap-4'>
              <Github className='h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer' />
              <Twitter className='h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer' />
              <Mail className='h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer' />
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
