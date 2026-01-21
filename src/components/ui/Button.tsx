import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    fullWidth?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    fullWidth = false,
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "py-4 px-6 rounded-2xl font-black text-lg transition-all border-2 flex items-center justify-center space-x-2 active:translate-y-[4px] disabled:opacity-70 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-orange text-white shadow-[0_4px_0_#c96500] hover:shadow-[0_2px_0_#c96500] hover:translate-y-[2px] active:shadow-none border-[#c96500]",
        secondary: "bg-blue text-white shadow-[0_4px_0_#1a7fa3] hover:shadow-[0_2px_0_#1a7fa3] hover:translate-y-[2px] active:shadow-none border-[#1a7fa3]",
        outline: "bg-transparent border-beige text-navy hover:bg-beige/20 hover:border-navy/20 active:translate-y-[2px]"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : children}
        </button>
    );
};
