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
        ],
      },
};

export default nextConfig;
