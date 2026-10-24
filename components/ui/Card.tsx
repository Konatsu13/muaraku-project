import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

export function Card({
  children,
  padding = "md",
  interactive = false,
  className = "",
  ...props
}: CardProps) {
  const paddingClasses = {
    none: "p-0",
    sm: "p-3 sm:p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={`bg-white dark:bg-[#18181B] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 transition-colors ${
        interactive
          ? "hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer shadow-xs hover:shadow-sm"
          : ""
      } ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
