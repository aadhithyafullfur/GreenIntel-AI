import React from 'react';

export interface AIChatbotIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  glow?: boolean;
  animated?: boolean;
}

export const AIChatbotIcon: React.FC<AIChatbotIconProps> = ({
  size = 'md',
  className = '',
  glow = true,
  animated = false,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6 p-0.5',
    sm: 'w-8 h-8 p-1',
    md: 'w-10 h-10 p-1.5',
    lg: 'w-12 h-12 p-2',
    xl: 'w-14 h-14 p-2.5',
    '2xl': 'w-16 h-16 p-3',
  };

  const currentSizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-[#0E0E14]/90 dark:bg-[#070709]/95 border border-orange-500/40 dark:border-orange-500/50 shadow-md ${
        glow ? 'shadow-orange-500/20 hover:shadow-orange-500/40' : ''
      } transition-all duration-300 shrink-0 ${currentSizeClass} ${className}`}
    >
      {/* Subtle Ambient Pulse Ring if Animated */}
      {animated && (
        <span className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping opacity-75 pointer-events-none" />
      )}

      {/* Vector SVG AI Robot Face */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-orange-500"
      >
        {/* Antenna / Top Signal Node */}
        <circle cx="16" cy="3.5" r="1.75" fill="#F97316" className={animated ? 'animate-pulse' : ''} />
        <path d="M16 5.25V8.5" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />

        {/* Outer Robot Head Contour */}
        <rect
          x="6"
          y="8.5"
          width="20"
          height="17"
          rx="5.5"
          fill="#0F0F14"
          stroke="#F97316"
          strokeWidth="1.75"
        />

        {/* Side Ear/Connector Caps */}
        <rect x="3.75" y="14" width="2.25" height="6" rx="1" fill="#F97316" />
        <rect x="26" y="14" width="2.25" height="6" rx="1" fill="#F97316" />

        {/* Glowing Orange Eyes */}
        <circle cx="11.5" cy="15.5" r="2.25" fill="#F97316" />
        <circle cx="12.2" cy="14.8" r="0.75" fill="#FFFFFF" />

        <circle cx="20.5" cy="15.5" r="2.25" fill="#F97316" />
        <circle cx="21.2" cy="14.8" r="0.75" fill="#FFFFFF" />

        {/* Friendly Robot Mouth Line */}
        <path
          d="M12.5 21C13.5 22.2 18.5 22.2 19.5 21"
          stroke="#F97316"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default AIChatbotIcon;
