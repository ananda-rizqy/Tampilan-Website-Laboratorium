import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "danger" | "warning";
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "success" }) => {
  const styles = variant === "success" 
    ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
    : "bg-rose-100 text-rose-700 border-rose-200";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles}`}>
      {children}
    </span>
  );
};