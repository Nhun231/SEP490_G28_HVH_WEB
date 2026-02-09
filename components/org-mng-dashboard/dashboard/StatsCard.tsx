'use client';

import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    icon: 'bg-blue-400/20 text-white',
    text: 'text-white'
  },
  green: {
    bg: 'from-green-500 to-green-600',
    icon: 'bg-green-400/20 text-white',
    text: 'text-white'
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    icon: 'bg-orange-400/20 text-white',
    text: 'text-white'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    icon: 'bg-purple-400/20 text-white',
    text: 'text-white'
  }
};

export default function StatsCard({ title, value, icon, trend, color }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl shadow-lg p-6',
      'bg-gradient-to-br',
      colors.bg
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
          <p className={cn('text-3xl font-bold', colors.text)}>{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-100' : 'text-red-100'
              )}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-xs text-white/60">So với tháng trước</span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center text-3xl',
          colors.icon
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
