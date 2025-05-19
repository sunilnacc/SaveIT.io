'use client';

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

type CardHoverEffectProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardHoverEffect: React.FC<CardHoverEffectProps> = ({
  children,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative group/block overflow-hidden', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.span
            className="absolute h-[500px] w-[500px] rounded-full -translate-x-1/2 -translate-y-1/2 z-0"
            initial={{
              opacity: 0,
              scale: 0.3,
              x: position.x,
              y: position.y,
            }}
            animate={{
              opacity: 1,
              scale: 1.2,
              x: position.x,
              y: position.y,
              transition: { 
                type: 'spring',
                stiffness: 100,
                damping: 15,
                mass: 0.3
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.3,
              x: position.x,
              y: position.y,
              transition: { duration: 0.3 },
            }}
            style={{
              filter: 'blur(100px)',
              background: 'radial-gradient(circle, hsl(var(--primary)/0.8) 0%, transparent 80%)',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
              mixBlendMode: 'overlay',
            }}
          />
        )}
      </AnimatePresence>
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'rounded-xl h-full w-full overflow-hidden bg-card border border-border group-hover/block:border-primary/30 transition-colors duration-200',
        className
      )}
    >
      <div className="relative z-50 h-full">
        {children}
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h3 className={cn('font-semibold text-foreground', className)}>
      {children}
    </h3>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p className={cn('text-muted-foreground text-sm', className)}>
      {children}
    </p>
  );
};