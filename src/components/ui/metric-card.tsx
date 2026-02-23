import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card'; // Certifique-se de que o caminho está correto

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: '',
  primary: 'bg-primary/5 border-primary/20',
  success: 'bg-status-success-bg border-status-success/20',
  warning: 'bg-status-warning-bg border-status-warning/20',
  danger: 'bg-status-danger-bg border-status-danger/20',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-status-success/10 text-status-success',
  warning: 'bg-status-warning/10 text-status-warning',
  danger: 'bg-status-danger/10 text-status-danger',
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('overflow-hidden', variantStyles[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            
            {trend && (
              <p className={cn(
                'text-xs font-medium mt-1',
                trend.isPositive ? 'text-status-success' : 'text-status-danger'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}% vs mês anterior
              </p>
            )}
          </div>

          <div className={cn('p-2.5 rounded-lg', iconStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}