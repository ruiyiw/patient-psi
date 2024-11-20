/** @type {import('next').NextConfig} */
export default {
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
