import React from 'react';

/** Codeforces bar-chart mark */
export default function Codeforces({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      aria-label="Codeforces"
    >
      <rect x="3" y="10.5" width="4.5" height="10.5" rx="1.2" fill="#FFC107" />
      <rect x="9.75" y="3" width="4.5" height="18" rx="1.2" fill="#1F8ACB" />
      <rect
        x="16.5"
        y="7.5"
        width="4.5"
        height="13.5"
        rx="1.2"
        fill="#F44336"
      />
    </svg>
  );
}
