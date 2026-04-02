import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = "primary", size = "md", className, ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "border-2 border-slate-200 text-slate-600 hover:bg-slate-50",
    destructive: "bg-rose-500 text-white hover:bg-rose-600",
  };
  const sizes = { sm: "px-3 py-1 text-xs", md: "px-6 py-2 text-sm", lg: "px-8 py-4 text-base" };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};