import { Suspense } from "react"
import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WallpapersGrid } from "./WallpapersGrid"

const WALLPAPERS_JSON_URL =
  "https://raw.githubusercontent.com/CAPlayground/wallpapers/refs/heads/main/wallpapers.json"

const revalidateInterval = 1800


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "CAPlayground - Wallpapers",
    description: "Browse wallpapers made by the CAPlayground community",
    openGraph: {
      title: "CAPlayground - Wallpapers",
      description: "Browse wallpapers made by the CAPlayground community",
      type: "website",
    },
  }
}

interface WallpaperItem {
  id: string | number
  name: string
  creator: string
  description: string
  file: string
  preview: string
  from: string
}

interface WallpapersResponse {
  base_url: string
  wallpapers: WallpaperItem[]
}

async function getWallpapers(): Promise<WallpapersResponse | null> {
  try {
    const res = await fetch(WALLPAPERS_JSON_URL, {
      next: { revalidate: revalidateInterval },
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return null
    const data = (await res.json()) as WallpapersResponse
    if (!data || !Array.isArray(data.wallpapers) || typeof data.base_url !== "string") {
      return null
    }
    return data
  } catch {
    return null
  }
}

function isVideo(src: string) {
  const lower = src.toLowerCase()
  return lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.includes("/video/")
}

export default async function WallpapersPage() {
  const data = await getWallpapers()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative">
        <Navigation />

        <main className="relative">
          <section className="pt-16 md:pt-24 pb-8 md:pb-12">
            <div className="container mx-auto px-3 min-[600px]:px-4 lg:px-6">
              <div className="max-w-5xl mx-auto text-center mb-8 md:mb-10">
                <h1 className="font-heading text-5xl md:text-[50px] font-bold">Wallpaper Gallery</h1>
                <p className="text-muted-foreground mt-3">
                  Browse wallpapers made by the CAPlayground community.
                </p>
              </div>

              {!data && (
                <div className="max-w-xl mx-auto text-center text-sm text-muted-foreground">
                  Unable to load wallpapers right now. Please try again later.
                </div>
              )}

              {data && (
                <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
                  <WallpapersGrid data={data} />
                </Suspense>
              )}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  )
}
