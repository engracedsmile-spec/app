
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        http2: false,
        child_process: false,
        'node:events': false,
        'node:process': false,
        'node:util': false,
        'node:stream': false,
        'node:buffer': false,
        'node:url': false,
        'node:path': false,
        'node:os': false,
        'node:fs': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:querystring': false,
        'node:assert': false,
        'node:constants': false,
        'node:timers': false,
        'node:cluster': false,
        'node:worker_threads': false,
        'node:perf_hooks': false,
        'node:async_hooks': false,
        'node:inspector': false,
        'node:trace_events': false,
        'node:vm': false,
        'node:readline': false,
        'node:repl': false,
        'node:tty': false,
        'node:dgram': false,
        'node:dns': false,
        'node:net': false,
        'node:punycode': false,
        'node:string_decoder': false,
        'node:sys': false,
        'node:util': false,
        'node:v8': false,
        'node:vm': false,
        'node:worker_threads': false,
      };
    }
    
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.gifyu.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's14.gifyu.com',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'postimg.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.dealeralchemist.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
   transpilePackages: ['lucide-react'], // This is the fix
};

module.exports = nextConfig;
