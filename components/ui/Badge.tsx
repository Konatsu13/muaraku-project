import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "lost" | "found" | "verified" | "neutral" | "success" | "error";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
  ...props
}: BadgeProps) {
  const variantClasses = {
    lost: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20",
    found: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
    verified: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    neutral: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700",
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    error: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
  };

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs font-medium rounded-full",
    md: "px-3 py-1 text-xs font-semibold rounded-full",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
