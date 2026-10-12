import React from 'react';

interface MuaraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  subtext?: string;
  onClick?: () => void;
}

export const MuaraLogo: React.FC<MuaraLogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
  subtext,
  onClick,
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8 rounded-xl p-1', text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10 rounded-2xl p-1.5', text: 'text-base sm:text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-12 h-12 rounded-2xl p-2', text: 'text-xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16 rounded-3xl p-2.5', text: 'text-2xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <div className={`relative ${currentSize.box} bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-orange-400/20 dark:from-orange-500/20 dark:via-amber-500/15 dark:to-orange-400/25 border border-primary-container/30 dark:border-primary-container/40 flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/15 ring-1 ring-white/50 dark:ring-white/10 group-hover:scale-105 group-hover:shadow-orange-500/30 transition-all`}>
        <img
          src="/logo.svg"
          alt="MuaraKu Logo"
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-dark-surface" />
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <span className={`font-headline-md font-bold tracking-tight text-on-surface dark:text-surface-white group-hover:text-primary-container transition-colors leading-tight ${currentSize.text}`}>
            Muara<span className="text-primary-container">Ku</span>
          </span>
          {subtext && (
            <span className={`font-medium text-muted-text -mt-0.5 tracking-wide truncate ${currentSize.sub}`}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
