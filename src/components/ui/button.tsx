import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

const variants = {
  primary: 'bg-brand-dark text-brand-text hover:brightness-95 active:brightness-90',
  ghost: 'glass hover:bg-brand-light/30 text-brand-text',
  danger: 'bg-red-500/80 text-white hover:bg-red-500/90',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full font-medium transition-all duration-200 inline-flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
