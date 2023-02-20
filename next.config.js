/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true
      },
    ]
  },
  reactStrictMode: true,
}

module.exports = nextConfig
