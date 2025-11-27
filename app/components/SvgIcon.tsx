'use client';

interface SvgIconProps {
  path: string;
  className?: string;
}

export const SvgIcon: React.FC<SvgIconProps> = ({ path, className = 'w-6 h-6' }) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
    </svg>
  );
};
