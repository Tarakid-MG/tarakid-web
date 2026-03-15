import React, { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: LucideIcon;
    error?: string;
    rightElement?: ReactNode;
    rightAction?: ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    icon: Icon,
    error,
    rightElement,
    rightAction,
    className = '',
    ...props
}) => {
    return (
        <div className={`w-full ${className}`}>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-navy tracking-tight">{label}</label>
                {rightElement}
            </div>
            <div className="relative">
                <input
                    className={`w-full ${Icon ? 'pl-12' : 'px-4'} ${rightAction ? 'pr-12' : 'pr-4'} py-3 border-2 border-beige rounded-2xl focus:border-blue focus:ring-4 focus:ring-blue/10 outline-none transition-all font-medium text-navy bg-white placeholder:text-navy/30 ${error ? 'border-red-500' : ''}`}
                    {...props}
                />
                {Icon && (
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/30" />
                )}
                {rightAction && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {rightAction}
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-500 font-bold">{error}</p>}
        </div>
    );
};
