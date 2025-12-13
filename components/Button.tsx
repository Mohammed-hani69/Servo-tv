import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  block?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  block = false,
  ...props 
}) => {
  const baseStyles = "tv-interactive tv-focus px-6 py-3 rounded-lg font-semibold transition-all duration-200 border-2 border-transparent flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:bg-blue-700",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 focus:bg-slate-600",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:bg-red-700"
  };

  const widthClass = block ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;