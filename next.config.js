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
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
