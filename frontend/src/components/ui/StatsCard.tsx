"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  onClick?: () => void;
  href?: string;
  loading?: boolean;
}

const toDarkBg = (cls: string) => {
  const m = cls.match(/^bg-(\w+)-100$/);
  return m ? `dark:bg-${m[1]}-900/40` : '';
};

const toDarkText = (cls: string) => {
  const m = cls.match(/^text-(\w+)-600$/);
  return m ? `dark:text-${m[1]}-400` : '';
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  onClick,
  href,
  loading = false
}) => {
  const CardContent = () => (
    <div className={`h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-200 ${
      (onClick || href) ? 'hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer transform hover:-translate-y-1' : ''
    } ${loading ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {loading ? (
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? (
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              ) : (
                subtitle
              )}
            </p>
          )}
          {trend && !loading && (
            <div className="flex items-center mt-2">
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                trend.isPositive
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
              }`}>
                <span className={`mr-1 ${trend.isPositive ? '↗' : '↘'}`}>
                  {trend.isPositive ? '↗' : '↘'}
                </span>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </div>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 ${iconBg} ${toDarkBg(iconBg)} rounded-xl flex items-center justify-center ml-4 transition-transform duration-200 ${
          (onClick || href) ? 'group-hover:scale-110' : ''
        }`}>
          {loading ? (
            <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ) : (
            <Icon className={`w-7 h-7 ${iconColor} ${toDarkText(iconColor)}`} />
          )}
        </div>
      </div>
    </div>
  );

  if (href && !onClick) {
    return (
      <a href={href} className="block group h-full">
        <CardContent />
      </a>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className="group h-full">
        <CardContent />
      </div>
    );
  }

  return <CardContent />;
};

export default StatsCard;


