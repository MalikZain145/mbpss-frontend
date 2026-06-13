import React from 'react';

export default function MBPSSLogo({ size = 'default' }) {
  const height = size === 'large' ? 60 : size === 'small' ? 38 : 46;

  return (
    <svg height={height} viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Gold gradient for icon */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8c96a"/>
          <stop offset="100%" stopColor="#b8832a"/>
        </linearGradient>
        {/* Dark fill for icon interior */}
        <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d2d4a"/>
          <stop offset="100%" stopColor="#061a2e"/>
        </linearGradient>
      </defs>

      {/* ── ICON: Hexagon with stylised M key-shape ── */}
      {/* Outer hexagon */}
      <polygon
        points="30,4 52,17 52,43 30,56 8,43 8,17"
        fill="url(#goldGrad)"
      />
      {/* Inner hexagon */}
      <polygon
        points="30,10 47,20 47,40 30,50 13,40 13,20"
        fill="url(#navyGrad)"
      />

      {/* Stylised key-lines forming abstract "M" / property mark */}
      {/* Left vertical */}
      <rect x="18" y="21" width="3.5" height="18" rx="1.5" fill="#c9a84c"/>
      {/* Right vertical */}
      <rect x="38.5" y="21" width="3.5" height="18" rx="1.5" fill="#c9a84c"/>
      {/* Left diagonal */}
      <path d="M18 21 L30 32" stroke="#c9a84c" strokeWidth="3.2" strokeLinecap="round"/>
      {/* Right diagonal */}
      <path d="M42 21 L30 32" stroke="#c9a84c" strokeWidth="3.2" strokeLinecap="round"/>
      {/* Centre dot */}
      <circle cx="30" cy="32" r="2.5" fill="#e8c96a"/>

      {/* ── WORDMARK ── */}
      {/* MBPSS in bold serif */}
      <text
        x="64"
        y="33"
        fontFamily="'Playfair Display', 'Georgia', serif"
        fontWeight="800"
        fontSize="27"
        fill="#ffffff"
        letterSpacing="0.5"
      >
        MBPSS
      </text>
      {/* Tagline */}
      <text
        x="64"
        y="50"
        fontFamily="'DM Sans', 'Arial', sans-serif"
        fontWeight="500"
        fontSize="8.5"
        fill="#c9a84c"
        letterSpacing="3"
      >
        PROPERTY SOLUTIONS
      </text>
    </svg>
  );
}