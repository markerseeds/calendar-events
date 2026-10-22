import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Don't let `next dev` generate an AGENTS.md file in the project root.
  agentRules: false,
};

export default nextConfig;
