import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'yellow' | 'blue' | 'orange';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'yellow'
}) => {
    const variants = {
        yellow: "border-yellow",
        blue: "border-lightBlue",
        orange: "border-orange"
    };

    return (
        <div className={`bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-10 border-b-8 transform hover:scale-[1.01] transition-transform duration-300 ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
};
