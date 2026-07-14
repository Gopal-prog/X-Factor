import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, action, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-2xl glass-panel glow-hover p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          {title && <h3 className="text-sm font-semibold text-text tracking-wide">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
