interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
}

export function Logo({ size = 'md', className = '', showText = true, showTagline = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-sm', tagline: 'text-xs' },
    md: { icon: 'w-12 h-12', text: 'text-xl', tagline: 'text-xs' },
    lg: { icon: 'w-16 h-16', text: 'text-2xl', tagline: 'text-sm' }
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Official Logo Icon */}
      <div className={`${sizeConfig.icon} bg-black rounded-xl flex items-center justify-center border-2 border-[#81d8d0] shadow-lg`}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 64 64"
          className="p-1"
        >
          <path 
            d="M8 20L20 36L32 20L44 36L56 20L48 48H16L8 20Z" 
            fill="#fdd835"
          />
        </svg>
      </div>
      
      {/* Text Block */}
      {showText && (
        <div className="flex flex-col">
          <div className={`${sizeConfig.text} font-bold leading-tight tracking-tight`}>
            <span className="text-[#81d8d0]">PropTrader</span>
            <span className="text-foreground"> Journal</span>
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
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizes[size]} bg-black rounded-xl flex items-center justify-center border-2 border-[#81d8d0] shadow-lg ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 64 64"
        className="p-1"
      >
        <path 
          d="M8 20L20 36L32 20L44 36L56 20L48 48H16L8 20Z" 
          fill="#fdd835"
        />
      </svg>
    </div>
  );
}