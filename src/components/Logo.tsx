type LogoProps = {
  size?: number
  withWordmark?: boolean
}

export function Logo({ size = 40, withWordmark = false }: LogoProps) {
  return (
    <span className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <svg
        aria-hidden="true"
        height={size}
        viewBox="0 0 64 64"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mda-edge" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="55%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="mda-core" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <radialGradient id="mda-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" fill="url(#mda-glow)" r="30" />
        <path
          d="M32 5 L58 22 L52 53 L12 53 L6 22 Z"
          fill="none"
          stroke="url(#mda-edge)"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
        <path
          d="M32 16 L46 24 L42 42 L22 42 L18 24 Z"
          fill="rgba(168, 85, 247, 0.12)"
          stroke="url(#mda-edge)"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
        <circle cx="32" cy="29" fill="url(#mda-core)" r="6" />
        <circle cx="18" cy="24" fill="#06b6d4" r="3" />
        <circle cx="46" cy="24" fill="#f59e0b" r="3" />
        <circle cx="22" cy="42" fill="#ec4899" r="2.4" />
        <circle cx="42" cy="42" fill="#8b5cf6" r="2.4" />
        <line stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" x1="18" x2="32" y1="24" y2="29" />
        <line stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" x1="46" x2="32" y1="24" y2="29" />
        <line stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" x1="22" x2="32" y1="42" y2="29" />
        <line stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" x1="42" x2="32" y1="42" y2="29" />
      </svg>
      {withWordmark ? (
        <span className="logo-wordmark">
          <strong>Migration Decision Assistant</strong>
          <small>Open source · Reference guidance</small>
        </span>
      ) : null}
    </span>
  )
}
