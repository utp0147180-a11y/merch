interface TeddyBearLogoProps {
  size?: number;
  className?: string;
}

export default function TeddyBearLogo({ size = 40, className = '' }: TeddyBearLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left Ear */}
      <circle cx="22" cy="22" r="14" fill="#A08278" />
      <circle cx="22" cy="22" r="8" fill="#D4A59A" />

      {/* Right Ear */}
      <circle cx="78" cy="22" r="14" fill="#A08278" />
      <circle cx="78" cy="22" r="8" fill="#D4A59A" />

      {/* Head */}
      <ellipse cx="50" cy="50" rx="35" ry="32" fill="#B89B8A" />

      {/* Face highlight */}
      <ellipse cx="50" cy="58" rx="20" ry="16" fill="#D4B5A5" />

      {/* Left Eye */}
      <circle cx="38" cy="45" r="4" fill="#2C1810" />
      <circle cx="39.5" cy="43.5" r="1.5" fill="#FFFFFF" />

      {/* Right Eye */}
      <circle cx="62" cy="45" r="4" fill="#2C1810" />
      <circle cx="63.5" cy="43.5" r="1.5" fill="#FFFFFF" />

      {/* Nose */}
      <ellipse cx="50" cy="56" rx="5" ry="4" fill="#8B7355" />
      <ellipse cx="50" cy="55" r="1.5" fill="#D4A59A" opacity="0.6" />

      {/* Mouth */}
      <path d="M45 61 Q50 66 55 61" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Cheeks */}
      <circle cx="30" cy="58" r="4" fill="#FFB6C1" opacity="0.4" />
      <circle cx="70" cy="58" r="4" fill="#FFB6C1" opacity="0.4" />
    </svg>
  );
}
