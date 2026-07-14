import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<string, string> = {
  primary: 'bg-gradient-to-r from-accent to-indigo-500 text-white shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5',
  secondary: 'bg-surface border border-border text-text hover:border-accent/50 hover:bg-surface-hover hover:-translate-y-0.5 shadow-sm',
  danger: 'bg-gradient-to-r from-critical to-red-600 text-white shadow-lg shadow-critical/20 hover:shadow-critical/40 hover:-translate-y-0.5',
  ghost: 'bg-transparent text-muted hover:text-text hover:bg-surface-hover',
};

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
