import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from '@/components/ValidatedInput';
import { RateLimiterHint } from '@/components/RateLimiterHint';
import { usePersistentDraft } from '@/hooks/usePersistentDraft';

interface FormData {
  name: string;
  email: string;
  rating: number;
  category: 'bug' | 'feature' | 'suggestion' | 'other' | '';
  message: string;
  phone_hidden: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  rating?: string;
  category?: string;
  message?: string;
}

const CATEGORIES = [
  { value: 'bug', label: '🐛 Bug Report' },
  { value: 'feature', label: '✨ Feature Request' },
  { value: 'suggestion', label: '💡 Suggestion' },
  { value: 'other', label: '📝 Other' },
];

export default function Feedback() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    rating: 0,
    category: '',
    message: '',
    phone_hidden: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showRateLimit, setShowRateLimit] = useState(false);
  const [rateResetTime, setRateResetTime] = useState(0);
  const submitDisabledUntil = useRef(0);

  const { saveDraft, clearDraft, loadDraft } = usePersistentDraft('feedback-form', formData);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setFormData(draft);
    }
  }, []);

  // Save draft every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (!submitted && (formData.name || formData.email || formData.message)) {
        saveDraft(formData);
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [formData, submitted, saveDraft]);

  // Rate limit countdown
  useEffect(() => {
    if (rateResetTime <= 0) return;

    const timer = setInterval(() => {
      setRateResetTime((prev) => {
        if (prev <= 1) {
          setShowRateLimit(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateResetTime]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.length < 2 || formData.name.length > 64) {
      newErrors.name = 'Enter your name (2-64 characters)';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Please rate your experience';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.message || formData.message.length < 10 || formData.message.length > 1000) {
      newErrors.message = 'Message must be 10-1000 characters';
    }

    // Honeypot validation
    if (formData.phone_hidden) {
      return false; // Bot detected
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
    if (errors.rating) {
      setErrors((prev) => ({
        ...prev,
        rating: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit
    const now = Date.now();
    if (now < submitDisabledUntil.current) {
      const waitTime = Math.ceil((submitDisabledUntil.current - now) / 1000);
      setRateResetTime(waitTime);
      setShowRateLimit(true);
      return;
    }

    if (!validateForm()) {
      // Shake animation on invalid form
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          rating: formData.rating,
          category: formData.category,
          message: formData.message,
        }),
      });

      if (response.status === 429) {
        setShowRateLimit(true);
        setRateResetTime(60);
        submitDisabledUntil.current = now + 65000;
        toast.error('You\'re sending feedback too fast. Try again later.');
        setIsSubmitting(false);
        return;
      }

      // Try to parse JSON only if response has content
      let responseData: any = null;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        }
      } catch (parseError) {
        console.warn('Could not parse response as JSON:', parseError);
      }

      if (!response.ok) {
        if (responseData?.fieldErrors) {
          setErrors(responseData.fieldErrors);
          toast.error('Please fix the errors above');
        } else {
          toast.error('Server error — try again later.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      setSubmitted(true);
      clearDraft();
      toast.success('Thanks! Your feedback was submitted.');

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          rating: 0,
          category: '',
          message: '',
          phone_hidden: '',
        });
        setSubmitted(false);
      }, 3000);

      // Disable submit for 5 seconds
      submitDisabledUntil.current = now + 5000;
      setIsSubmitting(false);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Network error — please try again');
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.name.length >= 2 &&
    formData.name.length <= 64 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.rating >= 1 &&
    formData.rating <= 5 &&
    formData.category &&
    formData.message.length >= 10 &&
    formData.message.length <= 1000 &&
    !formData.phone_hidden;

  const canSubmit = isFormValid && !isSubmitting && !submitted;

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
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block"
          >
            <MessageCircle className="h-12 w-12 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">Send Feedback</h1>
          <p className="text-foreground/60">
            Help us improve QuizMaster Pro with your thoughts
          </p>
        </div>

        {/* Success State */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-center space-y-3"
          >
            <p className="text-green-900 dark:text-green-200 font-medium">
              ✓ Thank you for your feedback!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              We really appreciate your thoughts and will review them shortly.
            </p>
            <a
              href="#"
              className="inline-block text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              View community suggestions →
            </a>
          </motion.div>
        )}

        {/* Form */}
        {!submitted && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rate Limiter Hint */}
            <RateLimiterHint show={showRateLimit} retryAfter={rateResetTime} />

            {/* Name */}
            <ValidatedInput
              label="Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              error={errors.name}
              required
              maxLength={64}
            />

            {/* Email */}
            <ValidatedInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              error={errors.email}
              required
              autoComplete="email"
            />

            {/* Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Experience Rating
                <span className="text-destructive ml-1">*</span>
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleRatingChange(num)}
                    className="relative group"
                    aria-label={`Rate ${num} stars`}
                  >
                    <Star
                      className={`h-8 w-8 transition-all ${
                        num <= formData.rating
                          ? 'fill-accent text-accent'
                          : 'text-foreground/30 hover:text-foreground/60'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <span>{errors.rating}</span>
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-foreground"
              >
                Category
                <span className="text-destructive ml-1">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                aria-label="Feedback category"
                aria-invalid={!!errors.category}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-foreground"
              >
                Message
                <span className="text-destructive ml-1">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what you think..."
                rows={4}
                maxLength={1000}
                aria-label="Feedback message"
                aria-invalid={!!errors.message}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
              <div className="flex justify-between items-center">
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message}</p>
                )}
                <p className="text-xs text-foreground/50 ml-auto">
                  {formData.message.length} / 1000
                </p>
              </div>
            </div>

            {/* Honeypot */}
            <input
              type="text"
              name="phone_hidden"
              value={formData.phone_hidden}
              onChange={handleChange}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Submit */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground font-semibold py-2.5 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Feedback
                </>
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
