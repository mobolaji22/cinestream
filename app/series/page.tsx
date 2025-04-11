"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Replace mock data import with API import
import { getPopularSeries, getTopRatedSeries } from "@/lib/api"

export default function SeriesPage() {
  const [series, setSeries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setIsLoading(true)
        
        // Fetch data in parallel
        const [popularSeries, topRatedSeries] = await Promise.all([
          getPopularSeries(),
          getTopRatedSeries()
        ])
        
        // Combine all series
        const allSeries = [...popularSeries, ...topRatedSeries]
        
        // Remove duplicates
        const uniqueSeries = allSeries.filter((series, index, self) => 
          index === self.findIndex((s) => s.id === series.id)
        )
        
        setSeries(uniqueSeries)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching series:", error)
        setIsLoading(false)
      }
    }
    
    fetchSeries()
  }, [])

  // Get unique genres
  const allGenres = series.flatMap((series) => series.genres)
  const uniqueGenres = [...new Set(allGenres)].sort()

  // Filter series by genre
  const getFilteredSeries = (genre: string) => {
    if (genre === "all") return series
    return series.filter(series => series.genres.includes(genre))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-2xl">Loading series...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">TV Series</h1>

          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="overflow-x-auto pb-2">
              <TabsList className="w-fit">
                <TabsTrigger value="all">All</TabsTrigger>
                {uniqueGenres.map((genre) => (
                  <TabsTrigger key={genre} value={genre.toLowerCase()}>
                    {genre}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* We'll render content based on active tab */}
            <div className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {getFilteredSeries(activeTab).map((series) => (
                  <ContentCard
                    key={series.id}
                    id={series.id}
                    title={series.title}
                    posterUrl={series.posterUrl}
                    year={series.year}
                    rating={series.rating}
                    genres={series.genres}
                    type="series"
                    seasons={series.seasons}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

