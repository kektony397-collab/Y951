
import React from 'react';

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant: 'start' | 'stop' | 'reset';
}

const ControlButton: React.FC<ControlButtonProps> = ({ children, variant, ...props }) => {
  const baseClasses = "w-full flex items-center justify-center font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg shadow-lg";

  const variantClasses = {
    start: "bg-green-600 hover:bg-green-500 disabled:hover:bg-green-600 text-white focus:ring-green-500/50",
    stop: "bg-red-600 hover:bg-red-500 disabled:hover:bg-red-600 text-white focus:ring-red-500/50",
    reset: "bg-gray-600 hover:bg-gray-500 disabled:hover:bg-gray-600 text-white focus:ring-gray-500/50",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default ControlButton;
