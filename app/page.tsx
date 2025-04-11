"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { ContentCarousel } from "@/components/content-carousel"
import { getPopularMovies, getTopRatedMovies, getPopularSeries } from "@/lib/api"

export default function HomePage() {
  const [featuredContent, setFeaturedContent] = useState<any>(null)
  const [popularMovies, setPopularMovies] = useState<any[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<any[]>([])
  const [popularSeries, setPopularSeries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch data in parallel
        const [movies, topMovies, series] = await Promise.all([
          getPopularMovies(),
          getTopRatedMovies(),
          getPopularSeries()
        ])
        
        setPopularMovies(movies)
        setTopRatedMovies(topMovies)
        setPopularSeries(series)
        
        // Set a featured content randomly
        const allContent = [...movies, ...series]
        const randomIndex = Math.floor(Math.random() * allContent.length)
        setFeaturedContent(allContent[randomIndex])
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (isLoading || !featuredContent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-pulse text-2xl">Loading amazing content...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroBanner content={featuredContent} />

        <div className="container px-4 py-8 space-y-10">
          <ContentCarousel
            title="Popular Movies"
            content={popularMovies.slice(0, 10)}
          />
          <ContentCarousel 
            title="Top Rated Movies" 
            content={topRatedMovies.slice(0, 10)} 
          />
          <ContentCarousel 
            title="Popular Series" 
            content={popularSeries.slice(0, 10)} 
          />
          
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

