import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export function StarRating({
  value,
  onChange,
  error,
  label,
  required,
}: StarRatingProps) {
  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(rating);
    } else if (e.key === 'ArrowRight' && rating < 5) {
      e.preventDefault();
      onChange(rating + 1);
    } else if (e.key === 'ArrowLeft' && rating > 1) {
      e.preventDefault();
      onChange(rating - 1);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div
        className="flex gap-2"
        role="group"
        aria-label={label || 'Rating'}
        aria-invalid={!!error}
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            onKeyDown={(e) => handleKeyDown(e, num)}
            className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1 transition-transform hover:scale-110"
            aria-label={`${num} stars`}
            aria-pressed={value === num}
            tabIndex={value === num ? 0 : -1}
          >
            <Star
              className={cn(
                'h-8 w-8 transition-all',
                num <= value
                  ? 'fill-accent text-accent drop-shadow-md'
                  : 'text-foreground/20 hover:text-foreground/40'
              )}
            />
          </button>
        ))}
      </div>
      {error && (
        <p
          id="rating-error"
          className="text-sm text-destructive flex items-center gap-2"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
