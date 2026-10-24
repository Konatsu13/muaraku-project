import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    // Base classes: min 44px target on mobile, rounded, transition, focus-visible
    const baseClasses =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-colors select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer min-h-[44px]";

    const variantClasses = {
      primary:
        "bg-[#FB923C] hover:bg-[#EA580C] text-white shadow-xs focus-visible:ring-2 focus-visible:ring-[#C96A1B] focus-visible:ring-offset-2",
      secondary:
        "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700",
      outline:
        "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700",
      ghost:
        "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-xs focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[38px] sm:min-h-[36px]",
      md: "px-4 py-2.5 text-sm gap-2 min-h-[44px]",
      lg: "px-6 py-3.5 text-base gap-2.5 min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
