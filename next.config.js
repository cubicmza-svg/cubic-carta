/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'glowupdeco.com' }],
        destination: '/cotizar/glowup',
        permanent: false,
      },
      {
        source: '/',
        has: [{ type: 'host', value: 'www.glowupdeco.com' }],
        destination: '/cotizar/glowup',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'bigbangpelotero.com' }],
        destination: '/bigbang/:path*',
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.bigbangpelotero.com' }],
        destination: '/bigbang/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'drive.usercontent.google.com' },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
