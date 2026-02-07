import React from 'react';

interface SectionDividerProps {
  className?: string;
}

export default function SectionDivider({
  className = '',
}: SectionDividerProps) {
  return (
    <div
      className={`relative my-16 flex items-center justify-center ${className}`}
    >
      {/* Left gradient line */}
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-gray-300 dark:via-gray-700 dark:to-gray-700" />

      {/* Center diamond/dot decoration */}
      <div className="mx-4 flex items-center gap-2">
        <div className="size-1.5 rotate-45 bg-gray-300 dark:bg-gray-700" />
        <div className="size-2 rotate-45 border border-gray-300 dark:border-gray-700" />
        <div className="size-1.5 rotate-45 bg-gray-300 dark:bg-gray-700" />
      </div>

      {/* Right gradient line */}
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-300 to-gray-300 dark:via-gray-700 dark:to-gray-700" />
    </div>
  );
}
