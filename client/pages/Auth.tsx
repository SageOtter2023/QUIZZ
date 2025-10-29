import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from '@/components/ValidatedInput';
import { RateLimiterHint } from '@/components/RateLimiterHint';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showRateLimit, setShowRateLimit] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be 6+ characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-specific errors on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear general error when user modifies fields
    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.status === 429) {
        setShowRateLimit(true);
        toast.error('Too many login attempts. Please try again later.');
        setFailedAttempts(0);
        return;
      }

      if (response.status === 401) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setShowRateLimit(true);
        }

        setErrors({
          general: 'Invalid email or password',
        });
        toast.error('Invalid email or password');
        return;
      }

      if (!response.ok) {
        toast.error('Login failed. Please try again.');
        return;
      }

      const { token, user } = await response.json();

      // Store token
      if (formData.rememberMe) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('auth_token', token);
      }

      toast.success(`Welcome back, ${user.name}!`);
      
      // Reset attempts on success
      setFailedAttempts(0);
      setShowRateLimit(false);

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error — please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.password &&
    formData.password.length >= 6;

  const canSubmit = isFormValid && !isSubmitting;

  return (
    <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            ⚡ QuizMaster
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-foreground/60">Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm space-y-6">
          {/* Rate Limiter Hint */}
          <RateLimiterHint show={showRateLimit && failedAttempts >= 3} retryAfter={60} />

          {/* General Error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              role="alert"
            >
              {errors.general}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <ValidatedInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              required
              autoComplete="email"
              disabled={isSubmitting}
            />

            {/* Password */}
            <ValidatedInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded border-border accent-primary cursor-pointer"
                />
                <span className="text-foreground/70">Remember me</span>
              </label>
              <a
                href="#"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: canSubmit ? 1.02 : 1 }}
              whileTap={{ scale: canSubmit ? 0.98 : 1 }}
              disabled={!canSubmit}
              type="submit"
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-foreground/60">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              // TODO: Implement signup flow
              toast.info('Signup coming soon!');
            }}
          >
            Create Account
          </Button>
        </div>

        {/* Footer Help */}
        <p className="text-center text-xs text-foreground/50">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}
