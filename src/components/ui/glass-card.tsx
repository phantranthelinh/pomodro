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
        'shadow-lg p-6',
        className
      )}
    >
      {children}
    </div>
  );
}
