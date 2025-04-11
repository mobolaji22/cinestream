"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { ContentCarousel } from "@/components/content-carousel"
import {
  featuredMovie,
  featuredSeries,
  recommendedMovies,
  recommendedSeries,
  trendingMovies,
  trendingSeries,
  newReleases,
} from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function HomePage() {
  // Randomly choose between featuring a movie or series
  const [featured, setFeatured] = useState(featuredMovie)

  useEffect(() => {
    // In a real app, this would be based on user preferences or viewing history
    const random = Math.random()
    setFeatured(random > 0.5 ? featuredMovie : featuredSeries)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroBanner content={featured} />

        <div className="container px-4 py-8 space-y-10">
          <ContentCarousel
            title="Recommended for You"
            content={[...recommendedMovies, ...recommendedSeries].slice(0, 10)}
          />
          <ContentCarousel title="Trending Movies" content={trendingMovies} />
          <ContentCarousel title="Popular Series" content={recommendedSeries} />
          <ContentCarousel title="Trending Series" content={trendingSeries} />
          <ContentCarousel title="New Releases" content={newReleases} />
          <div className="py-12 space-y-6 text-center">
            <h2 className="text-2xl font-bold">Ready to start streaming?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create an account to get personalized recommendations and keep track of your watchlist.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg">Sign Up</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

