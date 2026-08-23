import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/documents/:path*',
        destination: '/admin/documents/:path*',
        permanent: true,
      },
      {
        source: '/knowledge/:path*',
        destination: '/admin/knowledge/:path*',
        permanent: true,
      },
      {
        source: '/departments/:path*',
        destination: '/admin/departments/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
