"use client";

import React, { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err: unknown) => void;
  className?: string;
  resetKey?: number;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (error: unknown) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  className = "",
  resetKey = 0,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onVerify, onExpire, onError });
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onError };
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    if (!siteKey || siteKey.includes("your_turnstile")) {
      return;
    }

    const scriptId = "cf-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token) => callbacksRef.current.onVerify(token),
            "expired-callback": () => callbacksRef.current.onExpire?.(),
            "error-callback": (err) => callbacksRef.current.onError?.(err),
            theme: "auto",
            size: "normal",
          });
        } catch (e) {
          callbacksRef.current.onError?.(e);
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
    }

    const handleLoad = () => {
      delete script?.dataset.loadError;
      renderWidget();
    };
    const handleError = (error: Event) => {
      if (script) {
        script.dataset.loadError = "true";
      }
      callbacksRef.current.onError?.(error);
    };
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (window.turnstile) {
      renderWidget();
    } else if (script.dataset.loadError === "true") {
      callbacksRef.current.onError?.(new Error("Cloudflare Turnstile script failed to load"));
    }

    if (!script.isConnected) {
      document.head.appendChild(script);
    }

    return () => {
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetKey]);

  if (!siteKey || siteKey.includes("your_turnstile")) {
    return null;
  }

  return (
    <div className={`flex justify-center my-2.5 ${className}`}>
      <div ref={containerRef} className="min-h-[65px]" />
    </div>
  );
}
