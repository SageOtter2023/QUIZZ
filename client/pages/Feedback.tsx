import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from '@/components/ValidatedInput';
import { ValidatedTextarea } from '@/components/ValidatedTextarea';
import { StarRating } from '@/components/StarRating';
import { fetchWithMock } from '@/lib/api-mock';

interface FormData {
  name: string;
  email: string;
  rating: number;
  category: string;
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

// Validation rules
const validateField = (name: string, value: any): string | undefined => {
  switch (name) {
    case 'name':
      if (!value) return 'Name is required';
      if (value.length < 2) return 'Name must be at least 2 characters';
      if (value.length > 64) return 'Name must be at most 64 characters';
      return undefined;

    case 'email':
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email';
      return undefined;

    case 'rating':
      if (value < 1 || value > 5) return 'Please rate your experience';
      return undefined;

    case 'category':
      if (!value) return 'Please select a category';
      if (!['bug', 'feature', 'suggestion', 'other'].includes(value)) return 'Invalid category';
      return undefined;

    case 'message':
      if (!value) return 'Message is required';
      if (value.length < 10) return 'Message must be at least 10 characters';
      if (value.length > 1000) return 'Message must be at most 1000 characters';
      return undefined;

    case 'phone_hidden':
      if (value) return 'Invalid submission'; // Honeypot
      return undefined;

    default:
      return undefined;
  }
};

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
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout>();

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('feedback_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
        // Show restore option
        toast.info('Draft restored. You can edit and resubmit.', {
          duration: 3000,
        });
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }

    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  // Save draft every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (!submitted && (formData.name || formData.email || formData.message)) {
        localStorage.setItem('feedback_draft', JSON.stringify(formData));
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [formData, submitted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change if field was touched
    if (touched[name as keyof FormData]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
    setTouched((prev) => ({
      ...prev,
      rating: true,
    }));
    const error = validateField('rating', rating);
    setErrors((prev) => ({
      ...prev,
      rating: error,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const newTouched: typeof touched = {};

    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof FormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName as keyof FormErrors] = error;
      }
      newTouched[fieldName] = true;
    });

    setErrors(newErrors);
    setTouched(newTouched);

    // Focus first invalid field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Shake animation on invalid form
      if (formRef.current) {
        formRef.current.classList.add('animate-shake');
        setTimeout(() => formRef.current?.classList.remove('animate-shake'), 500);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchWithMock('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          rating: formData.rating,
          category: formData.category,
          message: formData.message,
        }),
      });

      if (response.status === 429) {
        toast.error('You\'re sending feedback too fast — try again in a minute');
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        toast.error('Server error — try again later');
        setIsSubmitting(false);
        return;
      }

      // Success
      setSubmitted(true);
      localStorage.removeItem('feedback_draft');
      toast.success('Thanks — feedback submitted');

      // Reset form after 3 seconds
      successTimeoutRef.current = setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          rating: 0,
          category: '',
          message: '',
          phone_hidden: '',
        });
        setErrors({});
        setTouched({});
        setSubmitted(false);
      }, 3000);

      // Re-enable submit button after 5 seconds
      setTimeout(() => {
        setIsSubmitting(false);
      }, 5000);
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
            role="alert"
            aria-live="polite"
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
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6 p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm"
          >
            {/* Name */}
            <ValidatedInput
              label="Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Your name"
              error={touched.name ? errors.name : undefined}
              required
              maxLength={64}
              disabled={isSubmitting}
            />

            {/* Email */}
            <ValidatedInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="your@email.com"
              error={touched.email ? errors.email : undefined}
              required
              autoComplete="email"
              disabled={isSubmitting}
            />

            {/* Rating */}
            <StarRating
              value={formData.rating}
              onChange={handleRatingChange}
              error={touched.rating ? errors.rating : undefined}
              label="Experience Rating"
              required
            />

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
                onBlur={handleBlur}
                aria-label="Feedback category"
                aria-invalid={touched.category && !!errors.category}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50"
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {touched.category && errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Message */}
            <ValidatedTextarea
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tell us what you think..."
              error={touched.message ? errors.message : undefined}
              required
              maxLength={1000}
              showCharCount
              disabled={isSubmitting}
              rows={4}
            />

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
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold transition-all"
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
            </button>
          </form>
        )}

        {/* Developer note */}
        <div className="text-center text-xs text-foreground/40 p-4 border-t border-border/30">
          <p>
            💡 To use real API: set <code className="bg-secondary px-1 rounded">USE_MOCK_API = false</code> in{' '}
            <code className="bg-secondary px-1 rounded">lib/api-mock.ts</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
