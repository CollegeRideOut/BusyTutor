import { createFileRoute } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { PixelArt, pixelPatterns } from '../components/PixelArt';
import { CurrentPageContext } from './__root';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

export function RegisterPage() {
  let { setCurrentPage } = useContext(CurrentPageContext);
  useEffect(() => {
    setCurrentPage('register');
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically handle the registration logic
      console.log('Registration successful:', { email, password });
      // Navigate to practice page after successful registration
      onNavigate('practice');
    }
  };

  return (
    <div className='min-h-screen py-12 px-4 relative'>
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
          onClick={() => onNavigate('landing')}
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
                Join Busy Tutor
              </h1>
              <PixelArt pattern={pixelPatterns.loop} size={10} />
            </div>
            <p className='text-muted-foreground'>
              Create your account to start mastering programming fundamentals
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email Field */}
            <div className='space-y-2'>
              <Label htmlFor='email' className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-primary' />
                Email Address
              </Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                className={`bg-muted/50 border-muted-foreground/20 focus:border-primary ${
                  errors.email ? 'border-destructive' : ''
                }`}
              />
              {errors.email && (
                <p className='text-sm text-destructive'>{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <Label htmlFor='password' className='flex items-center gap-2'>
                <Lock className='h-4 w-4 text-primary' />
                Password
              </Label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Create a password'
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

            {/* Confirm Password Field */}
            <div className='space-y-2'>
              <Label
                htmlFor='confirmPassword'
                className='flex items-center gap-2'
              >
                <Lock className='h-4 w-4 text-secondary' />
                Confirm Password
              </Label>
              <div className='relative'>
                <Input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='Confirm your password'
                  className={`bg-muted/50 border-muted-foreground/20 focus:border-secondary pr-10 ${
                    errors.confirmPassword ? 'border-destructive' : ''
                  }`}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4 text-muted-foreground' />
                  ) : (
                    <Eye className='h-4 w-4 text-muted-foreground' />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className='text-sm text-destructive'>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              className='w-full text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105'
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className='text-center mt-6'>
            <p className='text-muted-foreground'>
              Already have an account?{' '}
              <Button
                variant='link'
                className='p-0 h-auto text-primary hover:text-primary/80'
                onClick={() => onNavigate('landing')}
              >
                Sign in
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
  );
}
