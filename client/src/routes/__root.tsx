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
import { trpc } from '../lib/trpc';

// ---------------- AUTH CONTEXT ----------------
type AuthContextType = {
  user: { email: string; id: string } | null;
  token: string | null;
  login: (user: { email: string; password: string }) => Promise<boolean>;
  register: (user: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const loginMutation = trpc.user.login.useMutation();
  const registerMutation = trpc.user.register.useMutation();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { data, error, isLoading } = trpc.user.userInfo.useQuery(undefined, {
    enabled: false,
    refetchInterval: 200,
  });

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
  }, []);

  useEffect(() => {
    if (token && (!data?.success || !!error)) {
      logout();
    }

  }, [data, error, isLoading]);

  const login = async (user: { email: string; password: string }) => {
    try {
      const res = await loginMutation.mutateAsync(user);
      if (!res.success) throw Error('Login unsuccessful');
      setUser({ email: res.user.email, id: res.user.email });
      setToken(res.token);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return true;
    } catch (e) {
      logout();
      return false;
    }
  };

  const register = async (user: { email: string; password: string }) => {
    try {
      const res = await registerMutation.mutateAsync(user);
      if (!res.success) throw Error('Register unsuccessful');
      setUser({ email: res.user.email, id: res.user.email });
      setToken(res.token);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return true;
    } catch (e) {
      logout();
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate({ to: '/' });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
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
  const currentPage =
    path.startsWith('/practice')
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
    <div className="min-h-screen flex flex-col bg-background">
      <AuthProvider>
        {currentPage !== 'problem' && <Header currentPage={currentPage} />}
        <main className="flex flex-col flex-1">
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
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate({ to: '/' })}
          >
            <Code2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">Busy Tutor</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`hover:text-primary transition-colors ${
                currentPage === 'landing'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>

            <Link
              to="/practice"
              className={`hover:text-primary transition-colors ${
                currentPage === 'practice'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Practice
            </Link>

            {auth.user === null ? (
              <>
                <Button
                  variant={currentPage === 'login' ? 'default' : 'outline'}
                  onClick={() => navigate({ to: '/login' })}
                >
                  Login
                </Button>

                <Button
                  variant={currentPage === 'register' ? 'default' : 'outline'}
                  onClick={() => navigate({ to: '/register' })}
                >
                  Register
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span>{auth.user.email}</span>
                <Button onClick={auth.logout}>Log Out</Button>
              </div>
            )}
          </nav>

          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

// ---------------- FOOTER ----------------
export function Footer() {
  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Busy Tutor</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Master debugging, algorithms, data structures, and architecture
              through interactive challenges and comprehensive learning
              resources.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Learn</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Getting Started</a></li>
              <li><a href="#" className="hover:text-primary">Debugging Basics</a></li>
              <li><a href="#" className="hover:text-primary">Advanced Architecture</a></li>
              <li><a href="#" className="hover:text-primary">Best Practices</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Practice</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Algorithms</a></li>
              <li><a href="#" className="hover:text-primary">Data Structures</a></li>
              <li><a href="#" className="hover:text-primary">Debugging</a></li>
              <li><a href="#" className="hover:text-primary">Architecture</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <Github className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Mail className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground">
          © 2024 Busy Tutor. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
