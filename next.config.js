/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  serverRuntimeConfig: {
    logger: {
      level: 'info',
    },
    serverPath: 'app/api',
  }
}
