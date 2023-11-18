/** @type {import('next').NextConfig} */
BE_API = process.env.BE_API
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BE_API}/api/:path*`,
      }
    ]
  },
  reactStrictMode: true,
}

module.exports = nextConfig