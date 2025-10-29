import { InputHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function ValidatedInput({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: ValidatedInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-card text-foreground',
            'transition-colors placeholder:text-foreground/50',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            error
              ? 'border-destructive focus:ring-destructive'
              : 'border-border hover:border-border/80',
            className
          )}
          {...props}
        />
      </div>
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
      {helperText && !error && (
        <p className="text-xs text-foreground/60">{helperText}</p>
      )}
    </div>
  );
}
