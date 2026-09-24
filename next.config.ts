import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 65, 75, 85, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: "https", hostname: "creativelogomakers.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/clm/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/showcase/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/press/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)\\.(js|css|woff2|avif|webp|png|jpg|jpeg|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Legacy category pages → service details (301 for SEO equity)
      {
        source: "/categories/logo-branding",
        destination: "/logo-design/details",
        permanent: true,
      },
      {
        source: "/categories/website-app",
        destination: "/web-design/details",
        permanent: true,
      },
      {
        source: "/categories/business-advertising",
        destination: "/business-card-design/details",
        permanent: true,
      },
      {
        source: "/categories/art-illustration",
        destination: "/illustrations/details",
        permanent: true,
      },
      {
        source: "/categories/packaging-label",
        destination: "/product-packaging-design/details",
        permanent: true,
      },
      {
        source: "/categories/book-cover",
        destination: "/book-cover-design/details",
        permanent: true,
      },
      {
        source: "/categories/merchandise",
        destination: "/t-shirt-design/details",
        permanent: true,
      },
      {
        source: "/categories/social-content",
        destination: "/social-media-page-design/details",
        permanent: true,
      },
      {
        source: "/website-design/details",
        destination: "/web-design/details",
        permanent: true,
      },
      {
        source: "/packaging-design/details",
        destination: "/product-packaging-design/details",
        permanent: true,
      },
      {
        source: "/social-media-design/details",
        destination: "/social-media-page-design/details",
        permanent: true,
      },
      {
        source: "/art-illustration/details",
        destination: "/illustrations/details",
        permanent: true,
      },
      {
        source: "/business-advertising/details",
        destination: "/business-card-design/details",
        permanent: true,
      },
      {
        source: "/launch/website-design",
        destination: "/launch/web-design",
        permanent: true,
      },
      {
        source: "/launch/logo-branding",
        destination: "/launch/logo-design",
        permanent: true,
      },
      {
        source: "/launch/website-app",
        destination: "/launch/web-design",
        permanent: true,
      },
      {
        source: "/launch/packaging-label",
        destination: "/launch/product-packaging-design",
        permanent: true,
      },
      {
        source: "/launch/packaging-design",
        destination: "/launch/product-packaging-design",
        permanent: true,
      },
      {
        source: "/launch/book-cover",
        destination: "/launch/book-cover-design",
        permanent: true,
      },
      {
        source: "/launch/merchandise",
        destination: "/launch/t-shirt-design",
        permanent: true,
      },
      {
        source: "/launch/social-content",
        destination: "/launch/social-media-page-design",
        permanent: true,
      },
      {
        source: "/launch/social-media-design",
        destination: "/launch/social-media-page-design",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
