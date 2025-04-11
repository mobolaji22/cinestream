"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Replace mock data import with API import
import { getPopularMovies, getTopRatedMovies } from "@/lib/api"

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true)
        
        // Fetch data in parallel
        const [popularMovies, topRatedMovies] = await Promise.all([
          getPopularMovies(),
          getTopRatedMovies()
        ])
        
        // Combine all movies
        const allMovies = [...popularMovies, ...topRatedMovies]
        
        // Remove duplicates
        const uniqueMovies = allMovies.filter((movie, index, self) => 
          index === self.findIndex((m) => m.id === movie.id)
        )
        
        setMovies(uniqueMovies)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching movies:", error)
        setIsLoading(false)
      }
    }
    
    fetchMovies()
  }, [])

  // Get unique genres
  const allGenres = movies.flatMap((movie) => movie.genres)
  const uniqueGenres = [...new Set(allGenres)].sort()

  // Filter movies by genre
  const getFilteredMovies = (genre: string) => {
    if (genre === "all") return movies
    return movies.filter(movie => movie.genres.includes(genre))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-2xl">Loading movies...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Movies</h1>

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
                {getFilteredMovies(activeTab).map((movie) => (
                  <ContentCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterUrl={movie.posterUrl}
                    year={movie.year}
                    rating={movie.rating}
                    genres={movie.genres}
                    type="movie"
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

