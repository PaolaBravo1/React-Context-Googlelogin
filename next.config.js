/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/signin',
        permanent: true
      },
    ]
  },
  reactStrictMode: false,
}

module.exports = nextConfig
