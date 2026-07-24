'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { registerUser, useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import styles from './AuthForm.module.css';
import {
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  AlertCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GoogleIcon,
} from '@/components/ui/Icons';

const ROLE_OPTIONS = [
  { id: 'buyer', label: 'Buyer', icon: '🛒', desc: 'Shop products and services' },
  { id: 'vendor', label: 'Vendor', icon: '🏪', desc: 'Sell products or services' },
  { id: 'driver', label: 'Driver', icon: '🚗', desc: 'Offer ride or delivery services' },
  { id: 'creator', label: 'Creator', icon: '🎨', desc: 'Fundraise for causes' },
  { id: 'sponsor', label: 'Sponsor', icon: '💼', desc: 'Support events and campaigns' },
];

const VENDOR_CATEGORIES = [
  { id: 'product', label: 'Product', icon: '📦', desc: 'Physical goods (clothing, electronics, etc.)' },
  { id: 'food', label: 'Food', icon: '🍽️', desc: 'Restaurant, catering, food delivery' },
  { id: 'service', label: 'Service', icon: '🔧', desc: 'Repairs, consulting, professional services' },
  { id: 'other', label: 'Other', icon: '✨', desc: 'Something else (specify)' },
];

const DRIVER_CATEGORIES = [
  { id: 'taxi', label: 'Taxi', icon: '🚕', desc: 'On-demand rides - links to dispatch system' },
  { id: 'delivery', label: 'Delivery', icon: '📦', desc: 'Package/food delivery - links to pickup system' },
  { id: 'tour', label: 'Tour', icon: '🗺️', desc: 'Island tours, sightseeing' },
  { id: 'service', label: 'Driving Service', icon: '🚗', desc: 'Driving school, private driver, other services' },
];

interface RegisterFormData {
  // Step 1
  selectedRole: string;
  // Step 2 (vendor)
  vendorCategory: string;
  customCategory: string;
  // Step 2 (driver)
  driverCategory: string;
  // Step 3
  name: string;
  email: string;
  password: string;
}

type RegisterStep = 1 | 2 | 3;

export default function RegisterPage() {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState<RegisterStep>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const selectedRole = watch('selectedRole');
  const vendorCategory = watch('vendorCategory');
  const driverCategory = watch('driverCategory');
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
    
    if (score <= 2) return { level: 'weak', score: 1 };
    if (score === 3) return { level: 'fair', score: 2 };
    if (score === 4 || score === 5) return { level: 'good', score: 3 };
    return { level: 'strong', score: 4 };
  };

  const passwordStrength = getPasswordStrength(watch('password') || '');

  useEffect(() => {
    if (isAuthenticated) {
      logout();
      toast.success('You have been logged out to create a new account.');
    }
  }, [isAuthenticated, logout]);

  const handleSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    
    try {
      // Build the role based on selections
      let finalRole = 'buyer';
      let roleCategory = data.selectedRole;
      let vendorCategory = data.vendorCategory;
      let driverCategory = data.driverCategory;
      let customCategory = data.customCategory;

      if (data.selectedRole === 'vendor') {
        finalRole = data.vendorCategory === 'other' && data.customCategory
          ? `vendor_${data.customCategory.toLowerCase().replace(/\s+/g, '_')}`
          : `vendor_${data.vendorCategory}`;
      } else if (data.selectedRole === 'driver') {
        finalRole = `driver_${data.driverCategory}`;
      } else if (data.selectedRole === 'creator') {
        finalRole = 'creator';
      } else if (data.selectedRole === 'sponsor') {
        finalRole = 'sponsor';
      }

      const data = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: finalRole,
        role_category: data.selectedRole || 'buyer',
        vendor_category: data.vendorCategory || undefined,
        driver_category: data.driverCategory || undefined,
        custom_category: data.customCategory || undefined,
      });

      toast.success('Registration successful! Please check your email.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const details = error.response?.data?.details;
      const message = error.response?.data?.message;
      const status = error.response?.status;

      if (details && Array.isArray(details) && details.length > 0) {
        details.forEach((detail: any) => {
          if (detail.field) {
            // Map backend field names to form field names
            const fieldMap: Record<string, string> = {
              name: 'name',
              email: 'email',
              password: 'password',
              vendor_category: 'vendorCategory',
              driver_category: 'driverCategory',
              custom_category: 'customCategory',
            };
            const fieldName = fieldMap[detail.field] || detail.field;
            setError(fieldName as any, { message: detail.message });
          }
        });
      } else if (message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('email') && (lowerMessage.includes('exists') || lowerMessage.includes('taken'))) {
          setError('email', { message: 'An account with this email already exists' });
        } else if (lowerMessage.includes('password')) {
          setError('password', { message: 'Password does not meet requirements' });
        } else if (lowerMessage.includes('name')) {
          setError('name', { message: 'Please enter a valid name' });
        } else {
          toast.error(message, { duration: 5000, style: { maxWidth: '400px' } });
        }
      } else {
        toast.error('Registration failed. Please try again.', { duration: 4000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = () => {
    if (step === 1) return selectedRole !== '';
    if (step === 2 && selectedRole === 'vendor') return vendorCategory !== '';
    if (step === 2 && selectedRole === 'driver') return driverCategory !== '';
    return true;
  };

  const canProceedToStep3 = () => {
    if (step === 2) {
      if (selectedRole === 'vendor') return vendorCategory !== '';
      if (selectedRole === 'driver') return driverCategory !== '';
      return true;
    }
    return true;
  };

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return { level: 'weak', score: 0 };
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 2) return { level: 'weak', score: 1 };
    if (score === 3) return { level: 'fair', score: 2 };
    if (score === 4 || score === 5) return { level: 'good', score: 3 };
    return { level: 'strong', score: 4 };
  };

  const passwordStrength = getPasswordStrength(watch('password') || '');

  const handleSubmit = async (data: any) => {
    setLoading(true);
    
    try {
      let finalRole = 'buyer';
      let roleCategory = data.selectedRole;

      if (data.selectedRole === 'vendor') {
        finalRole = data.vendorCategory === 'other' && data.customCategory
          ? `vendor_${data.customCategory.toLowerCase().replace(/\s+/g, '_')}`
          : `vendor_${data.vendorCategory}`;
      } else if (data.selectedRole === 'driver') {
        finalRole = `driver_${data.driverCategory}`;
      } else if (data.selectedRole === 'creator') {
        finalRole = 'creator';
      } else if (data.selectedRole === 'sponsor') {
        finalRole = 'sponsor';
      }

      const data = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: finalRole,
        role_category: data.selectedRole || 'buyer',
        vendor_category: data.vendorCategory || undefined,
        driver_category: data.driverCategory || undefined,
        custom_category: data.customCategory || undefined,
      });

      toast.success('Registration successful! Please check your email.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const details = error.response?.data?.details;
      const message = error.response?.data?.message;
      const status = error.response?.status;

      if (details && Array.isArray(details) && details.length > 0) {
        details.forEach((detail: any) => {
          if (detail.field) {
            const fieldMap: Record<string, string> = {
              name: 'name',
              email: 'email',
              password: 'password',
              vendor_category: 'vendorCategory',
              driver_category: 'driverCategory',
              custom_category: 'customCategory',
            };
            const fieldName = fieldMap[detail.field] || detail.field;
            setError(fieldName as any, { message: detail.message });
          }
        });
      } else if (message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('email') && (lowerMessage.includes('exists') || lowerMessage.includes('taken'))) {
          setError('email', { message: 'An account with this email already exists' });
        } else if (lowerMessage.includes('password')) {
          setError('password', { message: 'Password does not meet requirements' });
        } else if (lowerMessage.includes('name')) {
          setError('name', { message: 'Please enter a valid name' });
        } else {
          toast.error(message, { duration: 5000, style: { maxWidth: '400px' } });
        }
      } else {
        toast.error('Registration failed. Please try again.', { duration: 4000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = () => {
    if (step === 1) return selectedRole !== '';
    if (step === 2 && selectedRole === 'vendor') return vendorCategory !== '';
    if (step === 2 && selectedRole === 'driver') return driverCategory !== '';
    return true;
  };

  const canProceedToStep3 = () => {
    if (step === 2) {
      if (selectedRole === 'vendor') return vendorCategory !== '';
      if (selectedRole === 'driver') return driverCategory !== '';
      return true;
    }
    return true;
  };

  const passwordStrength = getPasswordStrength(watch('password') || '');

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return { level: 'weak', score: 0 };
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 2) return { level: 'weak', score: 1 };
    if (score === 3) return { level: 'fair', score: 2 };
    if (score === 4 || score === 5) return { level: 'good', score: 3 };
    return { level: 'strong', score: 4 };
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
          {/* Step Indicator */}
          <motion.div
            className={styles.stepIndicator}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="stepNumber">1</div>
              <span className="stepLabel">Role</span>
            </div>
            <div className={`stepConnector ${step > 1 ? 'completed' : ''}`} />
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="stepNumber">2</div>
              <span className="stepLabel">Details</span>
            </div>
            <div className={`stepConnector ${step > 2 ? 'completed' : ''}`} />
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="stepNumber">3</div>
              <span className="stepLabel">Account</span>
            </div>
          </motion.div>

          {/* Step 1: Role Selection */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.header}>
                  <motion.h2
                    className={styles.title}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    Create your account
                  </motion.h2>
                  <motion.p
                    className={styles.subtitle}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    Choose how you want to use IslandHub
                  </motion.p>
                </div>

                <motion.div
                  className={styles.roleSelector}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <motion.button
                      key={role.id}
                      onClick={() => setValue('selectedRole', role.id)}
                      className={`roleCard ${selectedRole === role.id ? 'selected' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      style={{ borderColor: selectedRole === role.id ? 'var(--ocean-500)' : 'var(--border, var(--sand-200))' }}
                    >
                      <span className="roleIcon">{role.icon}</span>
                      <span className="roleLabel">{role.label}</span>
                      <span className="roleDesc">{role.desc}</span>
                      {selectedRole === role.id && (
                        <motion.span
                          className="checkIcon"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: -90 }}
                          transition={{ duration: 0.2 }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                  ))}
                </motion.div>

                <motion.div
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <motion.button
                    type="button"
                    className="backButton"
                    onClick={() => setStep(1)}
                    disabled={!canProceedToStep2()}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={!canProceedToStep2()}
                  >
                    Continue
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 2: Role-specific details */}
            <AnimatePresence mode="wait">
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.header}>
                    <motion.h2
                      className={styles.title}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      {selectedRole === 'vendor' ? 'What type of vendor are you?' : 'What type of driving service?'}
                    </motion.h2>
                    <motion.p
                      className={styles.subtitle}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {selectedRole === 'vendor'
                        ? 'Select your vendor category'
                        : 'Select your driving service type'}
                    </motion.p>
                  </div>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    {selectedRole === 'vendor' && (
                      <>
                        {VENDOR_CATEGORIES.map((cat) => (
                          <motion.button
                            key={cat.id}
                            onClick={() => setValue('vendorCategory', cat.id)}
                            className={`roleCard ${vendorCategory === cat.id ? 'selected' : ''}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="roleIcon">{cat.icon}</span>
                            <span className="roleLabel">{cat.label}</span>
                            <span className="roleDesc">{cat.desc}</span>
                            {vendorCategory === cat.id && (
                              <motion.span
                                className="checkIcon"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: -90 }}
                              >
                                ✓
                              </motion.span>
                            )}
                          </motion.button>
                        ))}
                        {vendorCategory === 'other' && (
                          <motion.div
                            className="mt-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <label className="label">Describe your category</label>
                            <input
                              type="text"
                              value={watch('customCategory') || ''}
                              onChange={(e) => setValue('customCategory', e.target.value)}
                              placeholder="e.g., Photographer, Event Planner..."
                              className="input"
                              placeholder="e.g., Photographer, Event Planner..."
                            />
                          </motion.div>
                        )}
                      </>
                    )}

                    {selectedRole === 'driver' && (
                      <>
                        {DRIVER_CATEGORIES.map((cat) => (
                          <motion.button
                            key={cat.id}
                            onClick={() => setValue('driverCategory', cat.id)}
                            className={`roleCard ${driverCategory === cat.id ? 'selected' : ''}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="roleIcon">{cat.icon}</span>
                            <span className="roleLabel">{cat.label}</span>
                            <span className="roleDesc">{cat.desc}</span>
                            {driverCategory === cat.id && (
                              <motion.span
                                className="checkIcon"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: -90 }}
                              >
                                ✓
                              </motion.span>
                            )}
                          </motion.button>
                        ))}
                      </>
                    )}

                    {(selectedRole === 'creator' || selectedRole === 'sponsor') && (
                      <motion.div
                        className="text-center py-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-ink-secondary">
                          You'll be able to {selectedRole === 'creator' ? 'create fundraising campaigns' : 'sponsor campaigns'} after verification.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div
                    className="flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <motion.button
                      type="button"
                      className="backButton"
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <ChevronLeftIcon className="w-5 h-5 mr-2" />
                      Back
                    </motion.button>

                    <motion.button
                      type="button"
                      className="continueButton"
                      onClick={() => canProceedToStep2() && setStep(3)}
                      disabled={!canProceedToStep2()}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={!canProceedToStep2()}
                    >
                      <ChevronRightIcon className="w-5 h-5 ml-2" />
                      Continue
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 3: Account Details */}
              <AnimatePresence mode="wait">
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.header}>
                      <motion.h2
                        className={styles.title}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                      >
                        Create your account
                      </motion.h2>
                      <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        Enter your details to complete registration
                      </motion.p>
                    </div>

                    <AnimatePresence mode="wait">
                      <form onSubmit={handleSubmit(handleSubmit)} className="space-y-6" noValidate>
                        {/* Name Field */}
                        <motion.div
                          className={styles.fieldGroup}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                        >
                          <label htmlFor="name" className={styles.label}>
                            Full name <span className="requiredIndicator" aria-hidden="true">*</span>
                          </label>
                          <input
                            {...register('name', {
                              required: 'Name is required',
                              minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters',
                              },
                            })}
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            className={styles.input}
                            placeholder="John Doe"
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? 'name-error' : undefined}
                            disabled={loading}
                          />
                          <AnimatePresence>
                            {errors.name && (
                              <motion.span
                                id="name-error"
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
                                <span>{errors.name.message}</span>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Email Field */}
                        <motion.div
                          className={styles.fieldGroup}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label htmlFor="email" className={styles.label}>
                            Email address <span className="requiredIndicator" aria-hidden="true">*</span>
                          </label>
                          <div className="inputWrapper">
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
                              className="input"
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
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                          className={styles.fieldGroup}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label htmlFor="password" className="label">
                            Password <span className="requiredIndicator" aria-hidden="true">*</span>
                          </label>
                          <div className="inputWrapper">
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
                              autoComplete="new-password"
                              required
                              className="input"
                              placeholder="••••••••"
                              aria-invalid={!!errors.password}
                              aria-describedby={errors.password ? 'password-error' : password ? 'password-strength' : undefined}
                              disabled={loading}
                            />
                            <button
                              type="button"
                              className="toggleButton"
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
                            {watch('password') && !errors.password && (
                              <motion.div
                                id="password-strength"
                                className="passwordStrength"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 4 }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <div
                                  className={`strengthBar ${passwordStrength.level}`}
                                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                                  role="progressbar"
                                  aria-valuenow={passwordStrength.score}
                                  aria-valuemin={0}
                                  aria-valuemax={4}
                                  aria-label={`Password strength: ${passwordStrength.level}`}
                                />
                                <span className={`strengthLabel ${passwordStrength.level}Label`}>
                                  {passwordStrength.level} password
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Submit Button */}
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
                          {loading ? 'Creating account...' : 'Create Account'}
                        </motion.button>
                      </form>
                    </AnimatePresence>

                    <motion.div
                      className="footer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                    >
                      <p className="footerText">
                        Already have an account?{' '}
                        <Link href="/login" className="footerLink">
                          Sign in
                        </Link>
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;