import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { PixelArt, pixelPatterns } from '../components/PixelArt';
import { Button } from '../components/ui/button';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useAuth } from './__root';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

export function LoginPage() {
  let auth = useAuth();

  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    emailOrUsername?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Email or username validation
    if (!emailOrUsername) {
      newErrors.emailOrUsername = 'Email or username is required';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      let valid = await auth.login({ email: emailOrUsername, password });
      if (valid) {
        navigate({ to: '/practice' });
      } else {
        throw new Error('handle loging failed ');
      }
    }
  };

  return (
    <div className='w-screen flex flex-col items-center'>
      <div
        className='min-h-screen py-12 px-4 relative'
        style={{ minWidth: 700 }}
      >
        {/* Background pixel art */}
        <div className='fixed inset-0 pointer-events-none z-0'>
          <div className='absolute top-20 left-10 opacity-10'>
            <PixelArt pattern={pixelPatterns.code} size={8} />
          </div>
          <div className='absolute top-40 right-20 opacity-10'>
            <PixelArt pattern={pixelPatterns.terminal} size={6} />
          </div>
          <div className='absolute bottom-40 left-20 opacity-10'>
            <PixelArt pattern={pixelPatterns.function} size={7} />
          </div>
          <div className='absolute bottom-20 right-10 opacity-10'>
            <PixelArt pattern={pixelPatterns.database} size={5} />
          </div>
        </div>

        <div className='container mx-auto max-w-md relative z-10'>
          {/* Back button */}
          <Button
            variant='ghost'
            className='mb-8 text-muted-foreground hover:text-foreground'
            onClick={() => navigate({ to: '/landing' })}
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Home
          </Button>

          <Card className='p-8 bg-gradient-to-br from-card to-muted/30 border-primary/20'>
            {/* Header */}
            <div className='text-center mb-8'>
              <div className='flex justify-center items-center gap-4 mb-4'>
                <PixelArt pattern={pixelPatterns.variable} size={10} />
                <h1 className='text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                  Welcome Back
                </h1>
                <PixelArt pattern={pixelPatterns.loop} size={10} />
              </div>
              <p className='text-muted-foreground'>
                Sign in to continue your programming journey
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Email or Username Field */}
              <div className='space-y-2'>
                <Label
                  htmlFor='emailOrUsername'
                  className='flex items-center gap-2'
                >
                  <Mail className='h-4 w-4 text-primary' />
                  Enter Email or Username
                </Label>
                <Input
                  id='emailOrUsername'
                  type='text'
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder='Email or username'
                  className={`bg-muted/50 border-muted-foreground/20 focus:border-primary ${
                    errors.emailOrUsername ? 'border-destructive' : ''
                  }`}
                />
                {errors.emailOrUsername && (
                  <p className='text-sm text-destructive'>
                    {errors.emailOrUsername}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className='space-y-2'>
                <Label htmlFor='password' className='flex items-center gap-2'>
                  <Lock className='h-4 w-4 text-primary' />
                  Enter Password
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Enter your password'
                    className={`bg-muted/50 border-muted-foreground/20 focus:border-primary pr-10 ${
                      errors.password ? 'border-destructive' : ''
                    }`}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4 text-muted-foreground' />
                    ) : (
                      <Eye className='h-4 w-4 text-muted-foreground' />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className='text-sm text-destructive'>{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type='submit'
                className='w-full text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105'
              >
                Sign In
              </Button>
            </form>

            {/* Register Link */}
            <div className='text-center mt-6'>
              <p className='text-muted-foreground'>
                Don't have an account?{' '}
                <Button
                  variant='link'
                  className='p-0 h-auto text-primary hover:text-primary/80'
                  onClick={() => navigate({ to: '/register' })}
                >
                  Create one
                </Button>
              </p>
            </div>
          </Card>

          {/* Additional pixel art */}
          <div className='flex justify-center mt-8'>
            <PixelArt pattern={pixelPatterns.code} size={8} />
          </div>
        </div>
      </div>
    </div>
  );
}
