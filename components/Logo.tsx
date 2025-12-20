import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="logoGradient" x1="0" y1="0" x2="200" y2="200">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
        <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Play Button Shape */}
    <path 
      d="M45 35C45 23.4477 57.5 16.2274 67.5 22.001L170 81.001C180 86.7746 180 101.225 170 107.0L67.5 165.999C57.5 171.773 45 164.552 45 153.0V35Z" 
      fill="url(#logoGradient)" 
      filter="url(#glow)"
    />
    
    {/* Lightning Bolt */}
    <path 
      d="M95 55L75 100H105L85 145L135 90H105L120 55H95Z" 
      fill="white"
      stroke="white"
      strokeWidth="4"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;