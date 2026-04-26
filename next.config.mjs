/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      "sodium-native": false,
      "require-addon": false
    };

    return config;
  }
};

export default nextConfig;
