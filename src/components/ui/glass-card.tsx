import { cn } from '@/lib/utils';

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'strong';
};

export function GlassCard({ children, className, variant = 'default' }: GlassCardProps) {
  return (
    <div
      className={cn(
        variant === 'strong' ? 'glass-strong' : 'glass',
        'p-6 transition-all duration-300 ease-out',
        className
      )}
    >
      {children}
    </div>
  );
}
