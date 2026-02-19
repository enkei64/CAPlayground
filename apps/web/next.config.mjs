/** @type {import('next').NextConfig} */
const isDesktop = process.env.NEXT_PUBLIC_DESKTOP === 'true';

const nextConfig = {
  // Static export for desktop builds (Electrobun)
  ...(isDesktop && { output: 'export' }),

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // trailingSlash: false seems more compatible with how some static handlers work
  ...(isDesktop && { trailingSlash: false }),
}

export default nextConfig
