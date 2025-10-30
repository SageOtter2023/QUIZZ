import { TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
}

export function ValidatedTextarea({
  label,
  error,
  helperText,
  className,
  id,
  showCharCount,
  maxLength,
  value,
  ...props
}: ValidatedTextareaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <textarea
        id={inputId}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border bg-card text-foreground',
          'transition-colors placeholder:text-foreground/50 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          error
            ? 'border-destructive focus:ring-destructive'
            : 'border-border hover:border-border/80',
          className
        )}
        value={value}
        maxLength={maxLength}
        {...props}
      />
      <div className="flex items-center justify-between gap-2">
        {error && (
          <div
            id={`${inputId}-error`}
            className="flex items-center gap-2 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {showCharCount && maxLength && (
          <p className={cn(
            'text-xs ml-auto',
            charCount > maxLength * 0.9
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-foreground/50'
          )}>
            {charCount} / {maxLength}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-foreground/60">{helperText}</p>
        )}
      </div>
    </div>
  );
}
