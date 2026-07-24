'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, useAuthStore } from '@/lib/auth';
import { toast } from '@/lib/toast';
import styles from './AuthForm.module.css';
import {
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
  AlertCircleIcon,
  CheckIcon,
  GoogleIcon,
} from '@/components/ui/Icons';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const password = watch('password');

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { level: 'weak' | 'fair' | 'good' | 'strong'; score: number } => {
    let score = 0;
    if (!pwd) return { level: 'weak', score: 0 };
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 2) return { level: 'weak', score };
    if (score === 3) return { level: 'fair', score };
    if (score === 4 || score === 5) return { level: 'good', score: 3 };
    return { level: 'strong', score: 4 };
  };

  const passwordStrength = getPasswordStrength(password || '');

  const handleGoogleLogin = async () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'https://islandhub.onrender.com/api'}/auth/google`;
  };

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setFieldErrors({});
    clearErrors();
    
    try {
      const data = await loginUser({ email, password });
      login(data.token, data.user, data.refresh_token);
      toast.success('Welcome back!');
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      const details = error.response?.data?.details;
      const message = error.response?.data?.message;
      const status = error.response?.status;

      // Handle field-specific errors
      if (details && Array.isArray(details) && details.length > 0) {
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
        details.forEach((detail: any) => {
          if (detail.field) {
            fieldErrors[detail.field as keyof LoginFormData] = detail.message;
            setError(detail.field as keyof LoginFormData, { message: detail.message });
          }
        });
        setFieldErrors(fieldErrors);
        
        // Show first error as toast
        const firstError = details[0];
        const detailMsg = firstError.field
          ? `${firstError.field}: ${firstError.message}`
          : firstError.message;
        toast.error(detailMsg, { duration: 5000, style: { maxWidth: '400px' } });
      } else if (message) {
        // Handle specific error messages
        const lowerMessage = message.toLowerCase();
        if (status === 401 || lowerMessage.includes('invalid') || lowerMessage.includes('incorrect')) {
          setError('password', { message: 'Incorrect password. Please try again.' });
          toast.error('Incorrect password. Please try again.', { duration: 5000 });
        } else if (lowerMessage.includes('not found') || lowerMessage.includes('does not exist')) {
          setError('email', { message: 'No account found with this email' });
          toast.error('No account found with this email', { duration: 5000 });
        } else if (lowerMessage.includes('verified') || lowerMessage.includes('verify')) {
          toast.error('Please verify your email before signing in', { duration: 5000 });
        } else {
          toast.error(message, { duration: 5000 });
        }
      } else {
        toast.error('Login failed. Please check your credentials.', { duration: 4000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.formContainer}>
        <motion.div
          className={styles.formCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className={styles.header}>
            <motion.h2
              className={styles.title}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Sign in to your account
            </motion.h2>
            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Or{' '}
              <Link href="/register" className="link">
                create a new account
              </Link>
            </motion.p>
          </div>

          <motion.div
            className={styles.divider}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div className="dividerLine" />
            <span className={styles.dividerText}>or continue with</span>
            <div className="dividerLine" />
          </motion.div>

          {/* Google OAuth Button */}
          <motion.button
            type="button"
            className="googleButton"
            onClick={handleGoogleLogin}
            disabled={loading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <svg className="googleIcon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.02-3.02C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="googleText">Continue with Google</span>
          </button>

          <div className={styles.divider}>
            <div className="dividerLine" />
            <span className={styles.dividerText}>or sign in with email</span>
            <div className="dividerLine" />
          </div>

          <AnimatePresence mode="wait">
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-6" noValidate>
              {/* Email Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="email" className="label">
                  Email address <span className="requiredIndicator" aria-hidden="true">*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address',
                      },
                    })}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={styles.input}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    disabled={loading}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.span
                        id="email-error"
                        className="errorText"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <svg className="errorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{errors.email.message}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Password Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="password" className="label">
                  Password <span className="requiredIndicator" aria-hidden="true">*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className={styles.input}
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : password ? 'password-strength' : undefined}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.toggleButton}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    disabled={loading}
                  >
                    <AnimatePresence mode="wait">
                      {showPassword ? (
                        <EyeOffIcon className="toggleIcon" key="eye-off" />
                      ) : (
                        <EyeIcon className="toggleIcon" key="eye" />
                      )}
                    </AnimatePresence>
                  </button>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.span
                        id="password-error"
                        className="errorText"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <svg className="errorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{errors.password.message}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Strength Meter */}
                <AnimatePresence>
                  {password && !errors.password && (
                    <motion.div
                      id="password-strength"
                      className="passwordStrength"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 4 }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div
                        className={`${styles.strengthBar} ${passwordStrength.level}`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                        role="progressbar"
                        aria-valuenow={passwordStrength.score}
                        aria-valuemin={0}
                        aria-valuemax={4}
                        aria-label={`Password strength: ${passwordStrength.level}`}
                      />
                      <span className={`${styles.strengthLabel} ${passwordStrength.level}Label`}>
                        {passwordStrength.level} password
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    {...register('rememberMe')}
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-5 w-5 text-accent-400 focus:ring-accent-400 border-border-primary dark:border-border-primary rounded-lg cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-ink-secondary dark:text-ink-tertiary">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="link">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <AnimatePresence>
                {(errors.email || errors.password) && (
                  <motion.div
                    className={`alert alertError`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    role="alert"
                  >
                    <svg className="alertIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div className="alertContent">
                      <div className="alertTitle">Sign in failed</div>
                      <p className="alertMessage">
                        {errors.email?.message || errors.password?.message || 'Please check your credentials and try again.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                className="submitButton"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </form>
          </AnimatePresence>

          <motion.div
            className={styles.footer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <p className={styles.footerText}>
              Don&apos;t have an account?{' '}
              <Link href="/register" className={styles.footerLink}>
                Create an account
              </Link>
            </p>
          </motion.div>
        </form>
      </div>
    </div>
    </>;
};

export default LoginPage;