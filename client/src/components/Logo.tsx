interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
}

export function Logo({ size = 'md', className = '', showText = true, showTagline = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', iconSize: '32', text: 'text-sm', tagline: 'text-xs' },
    md: { icon: 'w-12 h-12', iconSize: '48', text: 'text-xl', tagline: 'text-xs' },
    lg: { icon: 'w-16 h-16', iconSize: '64', text: 'text-2xl', tagline: 'text-sm' }
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Official Logo Icon */}
      <svg
        width={sizeConfig.iconSize}
        height={sizeConfig.iconSize}
        viewBox="0 0 64 64"
        className="shadow-lg"
      >
        <rect x="0" y="0" width="64" height="64" rx="12" fill="black" stroke="#81d8d0" strokeWidth="4"/>
        <path d="M8 20L20 36L32 20L44 36L56 20L48 48H16L8 20Z" fill="#fdd835"/>
        <line x1="16" y1="48" x2="48" y2="48" stroke="#fdd835" strokeWidth="2"/>
      </svg>
      
      {/* Text Block */}
      {showText && (
        <div className="flex flex-col">
          <div className={`${sizeConfig.text} font-bold leading-tight tracking-tight`}>
            <span className="text-[#4a9a96]">PropTrader</span>
            <span className="text-black"> Journal</span>
          </div>
          {showTagline && (
            <span className={`${sizeConfig.tagline} font-medium text-muted-foreground`}>
              Disciplined Trading
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: '32',
    md: '48', 
    lg: '64'
  };

  return (
    <svg
      width={sizes[size]}
      height={sizes[size]}
      viewBox="0 0 64 64"
      className={`shadow-lg ${className}`}
    >
      <rect x="0" y="0" width="64" height="64" rx="12" fill="black" stroke="#81d8d0" strokeWidth="4"/>
      <path d="M8 20L20 36L32 20L44 36L56 20L48 48H16L8 20Z" fill="#fdd835"/>
      <line x1="16" y1="48" x2="48" y2="48" stroke="#fdd835" strokeWidth="2"/>
    </svg>
  );
}