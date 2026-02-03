interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'yellow' | 'blue' | 'orange' | 'navy';
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'yellow',
    onClick
}) => {
    const variants = {
        yellow: "bg-white border-yellow text-black",
        blue: "bg-gradient-to-br from-blue via-blue to-lightBlue border-lightBlue text-white",
        orange: "bg-white border-orange text-black",
        navy: "bg-navy border-yellow text-white"
    };

    return (
        <div
            onClick={onClick}
            className={`rounded-[2.5rem] shadow-2xl p-6 md:p-10 border-b-8 transform hover:scale-[1.01] transition-transform duration-300 ${variants[variant]} ${className}`}
        >
            {children}
        </div>
    );
};
