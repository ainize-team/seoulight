import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 측 번들에서 특정 Node.js 모듈을 제외합니다
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false
      };
    }

    // Twitter API 관련 모듈을 외부 모듈로 처리
    config.externals = [...(config.externals || []), "twitter-api-v2"];

    return config;
  }
};

export default nextConfig;
