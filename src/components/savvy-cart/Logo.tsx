import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'medium' }) => {
  let textSizeClass = 'text-4xl md:text-5xl';
  if (size === 'small') {
    textSizeClass = 'text-2xl md:text-3xl';
  } else if (size === 'large') {
    textSizeClass = 'text-5xl md:text-7xl';
  }

  return (
    <div className={`font-bold ${textSizeClass} ${className}`}>
      <span className="neon-green-text">Savvy</span>
      <span className="neon-blue-text">Cart</span>
    </div>
  );
};

export default Logo;
