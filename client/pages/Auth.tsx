import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from '@/components/ValidatedInput';
import { RateLimiterHint } from '@/components/RateLimiterHint';
import { fetchWithMock } from '@/lib/api-mock';

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

// Validation rules
const validateField = (name: string, value: string): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email';
      return undefined;

    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be 6+ characters';
      return undefined;

    default:
      return undefined;
  }
};

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSignup = searchParams.get('mode') === 'signup';

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Demo credentials hint
  const demoEmail = 'demo@example.com';
  const demoPassword = 'Demo1234';

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: undefined,
      }));
    }
  };

  const handleLoginBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateLoginForm = (): boolean => {
    const newErrors: FormErrors = {};
    const newTouched: Record<string, boolean> = {};

    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    newTouched.email = true;
    newTouched.password = true;

    setErrors(newErrors);
    setTouched(newTouched);

    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) {
      if (formRef.current) {
        formRef.current.classList.add('animate-shake');
        setTimeout(() => formRef.current?.classList.remove('animate-shake'), 500);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchWithMock('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.status === 429) {
        setErrors({ general: 'Too many login attempts. Please try again later.' });
        toast.error('Too many attempts. Try again in a minute.');
        setFailedAttempts(0);
        setIsSubmitting(false);
        return;
      }

      if (response.status === 401) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        setErrors({ general: 'Invalid email or password' });
        toast.error('Invalid email or password');
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        toast.error('Login failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const { token, user } = await response.json();

      // Store token
      if (formData.rememberMe) {
        localStorage.setItem('qm_token', token);
        localStorage.setItem('qm_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('qm_token', token);
      }

      toast.success(`Welcome back, ${user.name}!`);
      setFailedAttempts(0);

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error — please try again');
      setIsSubmitting(false);
    }
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      validateSignupField(name, value);
    }
  };

  const validateSignupField = (name: string, value: string) => {
    const newErrors = { ...signupErrors };

    switch (name) {
      case 'name':
        if (!value || value.length < 3) {
          newErrors.name = 'Name must be at least 3 characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Enter a valid email';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value || value.length < 6) {
          newErrors.password = 'Password must be 6+ characters';
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (value !== signupData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setSignupErrors(newErrors);
  };

  const handleSignupBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateSignupField(name, value);
  };

  const validateSignupForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!signupData.name || signupData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!signupData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      newErrors.email = 'Enter a valid email';
    }

    if (!signupData.password || signupData.password.length < 6) {
      newErrors.password = 'Password must be 6+ characters';
    }

    if (signupData.confirmPassword !== signupData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setSignupErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignupForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchWithMock('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
        }),
      });

      if (!response.ok) {
        toast.error('Signup failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const { token, user } = await response.json();
      localStorage.setItem('qm_token', token);
      localStorage.setItem('qm_user', JSON.stringify(user));

      toast.success(`Welcome, ${user.name}! Account created.`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Network error — please try again');
      setIsSubmitting(false);
    }
  };

  const isLoginFormValid =
    formData.email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.password &&
    formData.password.length >= 6;

  const isSignupFormValid =
    signupData.name.length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email) &&
    signupData.password.length >= 6 &&
    signupData.confirmPassword === signupData.password;

  if (isSignup) {
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
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="text-foreground/60">Join us and start mastering your skills</p>
          </div>

          {/* Signup Card */}
          <div className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm space-y-6">
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Name */}
              <ValidatedInput
                label="Full Name"
                name="name"
                type="text"
                value={signupData.name}
                onChange={handleSignupChange}
                onBlur={handleSignupBlur}
                placeholder="John Doe"
                error={touched.name ? signupErrors.name : undefined}
                required
                disabled={isSubmitting}
              />

              {/* Email */}
              <ValidatedInput
                label="Email Address"
                name="email"
                type="email"
                value={signupData.email}
                onChange={handleSignupChange}
                onBlur={handleSignupBlur}
                placeholder="you@example.com"
                error={touched.email ? signupErrors.email : undefined}
                required
                autoComplete="email"
                disabled={isSubmitting}
              />

              {/* Password */}
              <ValidatedInput
                label="Password"
                name="password"
                type="password"
                value={signupData.password}
                onChange={handleSignupChange}
                onBlur={handleSignupBlur}
                placeholder="••••••••"
                error={touched.password ? signupErrors.password : undefined}
                required
                autoComplete="new-password"
                disabled={isSubmitting}
              />

              {/* Confirm Password */}
              <ValidatedInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                onBlur={handleSignupBlur}
                placeholder="••••••••"
                error={touched.confirmPassword ? signupErrors.confirmPassword : undefined}
                required
                autoComplete="new-password"
                disabled={isSubmitting}
              />

              {/* Submit */}
              <motion.button
                whileHover={{ scale: isSignupFormValid && !isSubmitting ? 1.02 : 1 }}
                whileTap={{ scale: isSignupFormValid && !isSubmitting ? 0.98 : 1 }}
                disabled={!isSignupFormValid || isSubmitting}
                type="submit"
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Create Account
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
                <span className="px-2 bg-card text-foreground/60">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Login form
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
          <RateLimiterHint show={failedAttempts >= 3} retryAfter={60} />

          {/* General Error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              role="alert"
              aria-live="polite"
            >
              {errors.general}
            </motion.div>
          )}

          <form ref={formRef} onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email */}
            <ValidatedInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleLoginChange}
              onBlur={handleLoginBlur}
              placeholder="you@example.com"
              error={touched.email ? errors.email : undefined}
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
              onChange={handleLoginChange}
              onBlur={handleLoginBlur}
              placeholder="••••••••"
              error={touched.password ? errors.password : undefined}
              required
              autoComplete="current-password"
              disabled={isSubmitting}
              helperText="Demo: demo@example.com / Demo1234"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleLoginChange}
                  className="rounded border-border accent-primary cursor-pointer"
                  disabled={isSubmitting}
                />
                <span className="text-foreground/70">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: isLoginFormValid && !isSubmitting ? 1.02 : 1 }}
              whileTap={{ scale: isLoginFormValid && !isSubmitting ? 0.98 : 1 }}
              disabled={!isLoginFormValid || isSubmitting}
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
            onClick={() => navigate('/auth?mode=signup')}
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
