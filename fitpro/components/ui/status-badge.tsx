import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'status-badge',
        {
          'status-success': status === 'success',
          'status-warning': status === 'warning',
          'status-danger': status === 'danger',
          'status-info': status === 'info',
          'status-neutral': status === 'neutral',
        },
        className
      )}
    >
      {children}
    </span>
  );
}