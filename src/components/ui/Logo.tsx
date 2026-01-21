import React from 'react';

interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-12' }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <img
                src="/logo/tarakid-logo.png"
                alt="TaraKid Logo"
                className="h-full object-contain"
            />
        </div>
    );
};
