import React from 'react';

export const AVATAR_TEMPLATES = [
  {
    id: 'avatar_ci',
    name: 'Circle Inspector',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad_ci" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#grad_ci)" />
        {/* Head */}
        <circle cx="50" cy="45" r="18" fill="#f8fafc" />
        {/* Cap */}
        <path d="M30 38 C30 25, 70 25, 70 38 Z" fill="#0f172a" />
        <rect x="28" y="36" width="44" height="5" rx="2" fill="#d97706" />
        <path d="M48 24 L52 24 L54 32 L46 32 Z" fill="#fbbf24" />
        {/* Body / Shoulders */}
        <path d="M18 90 C18 70, 30 65, 50 65 C70 65, 82 70, 82 90 Z" fill="#1e293b" />
        {/* Collar and tie */}
        <path d="M44 65 L50 75 L56 65 Z" fill="#f8fafc" />
        {/* Badge on chest */}
        <path d="M50 72 L53 76 L50 80 L47 76 Z" fill="#fbbf24" />
      </svg>
    )
  },
  {
    id: 'avatar_si',
    name: 'Sub Inspector',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad_si" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#grad_si)" />
        {/* Hair background */}
        <path d="M30 45 C25 55, 30 70, 35 70 C40 70, 35 55, 35 45" fill="#0f172a" />
        <path d="M70 45 C75 55, 70 70, 65 70 C60 70, 65 55, 65 45" fill="#0f172a" />
        {/* Head */}
        <circle cx="50" cy="45" r="18" fill="#fff1f2" />
        {/* Cap */}
        <path d="M32 38 C32 26, 68 26, 68 38 Z" fill="#1e293b" />
        <rect x="30" y="36" width="40" height="4" rx="2" fill="#b91c1c" />
        <circle cx="50" cy="30" r="3" fill="#fbbf24" />
        {/* Body / Shoulders */}
        <path d="M18 90 C18 70, 30 65, 50 65 C70 65, 82 70, 82 90 Z" fill="#334155" />
        <path d="M45 65 L50 73 L55 65 Z" fill="#fff1f2" />
        {/* Badges */}
        <circle cx="48" cy="74" r="2" fill="#fbbf24" />
        <circle cx="52" cy="74" r="2" fill="#fbbf24" />
      </svg>
    )
  },
  {
    id: 'avatar_constable',
    name: 'Constable',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad_const" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#grad_const)" />
        {/* Head */}
        <circle cx="50" cy="45" r="18" fill="#fafaf9" />
        {/* Cap */}
        <path d="M34 38 C34 28, 66 28, 66 38 Z" fill="#451a03" />
        <rect x="32" y="36" width="36" height="4" rx="1" fill="#f59e0b" />
        {/* Body / Shoulders */}
        <path d="M18 90 C18 70, 30 65, 50 65 C70 65, 82 70, 82 90 Z" fill="#475569" />
        <path d="M46 65 L50 72 L54 65 Z" fill="#fafaf9" />
      </svg>
    )
  },
  {
    id: 'avatar_commissioner',
    name: 'Commissioner',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad_comm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#grad_comm)" />
        {/* Gold Border ring inside */}
        <circle cx="50" cy="50" r="46" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" />
        {/* Head */}
        <circle cx="50" cy="45" r="18" fill="#f8fafc" />
        {/* Officer Peak Cap */}
        <path d="M26 36 C26 20, 74 20, 74 36 Z" fill="#020617" />
        <path d="M24 35 L76 35 L70 39 L30 39 Z" fill="#000000" />
        <rect x="32" y="33" width="36" height="3" fill="#fbbf24" />
        {/* Star Emblem */}
        <path d="M50 21 L52 25 L56 25 L53 28 L54 32 L50 30 L46 32 L47 28 L44 25 L48 25 Z" fill="#fbbf24" />
        {/* Body / Shoulders */}
        <path d="M18 90 C18 68, 28 62, 50 62 C72 62, 82 68, 82 90 Z" fill="#0f172a" />
        {/* Red Collar Tabs */}
        <path d="M38 64 L46 64 L44 72 L38 68 Z" fill="#991b1b" />
        <path d="M62 64 L54 64 L56 72 L62 68 Z" fill="#991b1b" />
        <circle cx="41" cy="67" r="1.5" fill="#fbbf24" />
        <circle cx="59" cy="67" r="1.5" fill="#fbbf24" />
        {/* Shirt tie */}
        <path d="M46 62 L50 75 L54 62 Z" fill="#f8fafc" />
        <path d="M49 68 L51 68 L51 85 L49 85 Z" fill="#000000" />
      </svg>
    )
  },
  {
    id: 'avatar_special_ops',
    name: 'Special Ops',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad_spec" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#grad_spec)" />
        {/* Head with helmet */}
        <circle cx="50" cy="45" r="18" fill="#1e293b" />
        {/* Tactical Helmet */}
        <path d="M30 42 C30 24, 70 24, 70 42 C70 45, 30 45, 30 42 Z" fill="#0f172a" />
        <rect x="34" y="40" width="32" height="6" fill="#475569" rx="1" />
        {/* Goggles / Visor */}
        <path d="M35 44 H65 V50 C65 54, 35 54, 35 50 Z" fill="#06b6d4" opacity="0.85" />
        <path d="M38 46 L62 46 L60 49 L40 49 Z" fill="#ffffff" opacity="0.4" />
        {/* Mask */}
        <path d="M40 54 L50 63 L60 54 L56 50 H44 Z" fill="#0f172a" />
        {/* Body / Shoulders */}
        <path d="M18 90 C18 70, 26 65, 50 65 C74 65, 82 70, 82 90 Z" fill="#18181b" />
        {/* Tactical vest detail */}
        <rect x="36" y="70" width="28" height="20" rx="4" fill="#27272a" />
        <line x1="42" y1="75" x2="58" y2="75" stroke="#18181b" strokeWidth="3" />
        <line x1="42" y1="82" x2="58" y2="82" stroke="#18181b" strokeWidth="3" />
      </svg>
    )
  }
];

export function Avatar({ avatarId, className = "avatar-img" }) {
  const fallbackSvg = (
    <svg className={`${className} avatar-fallback`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  if (!avatarId) {
    return fallbackSvg;
  }

  if (avatarId.startsWith('http://') || avatarId.startsWith('https://') || avatarId.startsWith('data:')) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={avatarId}
          alt="User Profile"
          className={className}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          onError={(e) => {
            e.target.style.display = 'none';
            const sibling = e.target.nextSibling;
            if (sibling) sibling.style.display = 'block';
          }}
        />
        <div style={{ display: 'none', width: '100%', height: '100%' }} className="avatar-fallback-wrapper">
          {fallbackSvg}
        </div>
      </div>
    );
  }

  const found = AVATAR_TEMPLATES.find(t => t.id === avatarId);
  if (found) {
    return found.svg(className);
  }

  return fallbackSvg;
}
