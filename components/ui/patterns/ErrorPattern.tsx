import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ErrorPatternProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorPattern({
  title = "Terjadi Kesalahan",
  message,
  onRetry,
  retryLabel = "Coba Lagi",
  className = "",
}: ErrorPatternProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-red-950 dark:text-red-200 mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 max-w-md mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
