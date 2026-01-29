/** @type {import('next').NextConfig} */
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7000').replace(/\/+$/, '')

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${apiBaseUrl}/api/:path*`,
        },
        {
          source: '/product-images/:path*',
          destination: `${apiBaseUrl}/product-images/:path*`,
        },
        {
          source: '/brand-logos/:path*',
          destination: `${apiBaseUrl}/brand-logos/:path*`,
        },
        {
          source: '/category-images/:path*',
          destination: `${apiBaseUrl}/category-images/:path*`,
        },
        {
          source: '/site-assets/:path*',
          destination: `${apiBaseUrl}/site-assets/:path*`,
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  webpack: (config, { dev }) => {
    if (!dev) return config;
    const ignored = /(?:^|[\\/])node_modules(?:[\\/]|$)|(?:^|[\\/])(pagefile\.sys|DumpStack\.log\.tmp)$/i;
    const applyWatchOptions = (cfg) => {
      cfg.watchOptions = {
        ...(cfg.watchOptions || {}),
        ignored,
      };
      return cfg;
    };

    if (Array.isArray(config)) return config.map(applyWatchOptions);
    return applyWatchOptions(config);
  },
}

module.exports = nextConfig
