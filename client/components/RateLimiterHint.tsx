import { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RateLimiterHintProps {
  show: boolean;
  retryAfter?: number; // in seconds
}

export function RateLimiterHint({ show, retryAfter = 60 }: RateLimiterHintProps) {
  const [remaining, setRemaining] = useState(retryAfter);

  useEffect(() => {
    if (!show) return;

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900"
          role="alert"
          aria-live="polite"
        >
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
          <div className="flex-1 text-sm text-amber-900 dark:text-amber-200">
            <p className="font-medium">
              You're sending feedback too fast
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Please try again in {remaining} second{remaining !== 1 ? 's' : ''}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
