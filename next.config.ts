import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

// Security headers for production hardening
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  // HSTS - only in production to avoid localhost issues
  ...(isProduction ? [{
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  }] : []),
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN' // Allow same-origin for wallet modals
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  },
];

const nextConfig: NextConfig = {
  // Remove console.log in production
  compiler: {
    removeConsole: isProduction ? { exclude: ['error', 'warn'] } : false,
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
};

export default nextConfig;
