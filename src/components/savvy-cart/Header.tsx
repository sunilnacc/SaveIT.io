import React from 'react';
import Logo from './Logo';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="py-4 px-4 md:px-8 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/dashboard">
          <Logo size="small" />
        </Link>
        {/* Placeholder for future icons like profile or settings */}
        <div></div>
      </div>
    </header>
  );
};

export default Header;
