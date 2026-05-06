import type { NextConfig } from 'next';

// Standalone output is only needed for the release artifact; enabling it
// unconditionally breaks `next start`. The release CI sets NEXT_STANDALONE=true.
const nextConfig: NextConfig = {
  ...(process.env['NEXT_STANDALONE'] === 'true' && { output: 'standalone' }),
};

export default nextConfig;
