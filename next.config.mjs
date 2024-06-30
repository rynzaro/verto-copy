/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'cryptologs.cc',
            //port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'assets.ref.finance',
            //port: '',
            pathname: '/**',
          }
        ],
      },
};

export default nextConfig;
