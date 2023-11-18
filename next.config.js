/** @type {import('next').NextConfig} */
BE_API = process.env.BE_API
IMG_API = "demo.data2.cash"

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BE_API}/api/:path*`,
      },
      {
        source: '/img/:path*',
        destination: `${IMG_API}/img/:path*`,
      }
    ]
  },
  reactStrictMode: true,
}

module.exports = nextConfig
