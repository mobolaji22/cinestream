"use client"

import type React from "react"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Replace mock data import with API import
import { searchContent } from "@/lib/api"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState("all")
  const [contentType, setContentType] = useState<"all" | "movie" | "series">("all")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query) {
      performSearch(query)
    } else {
      setResults([])
    }
  }, [query])

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return
    
    setIsLoading(true)
    try {
      const searchResults = await searchContent(searchTerm)
      setResults(searchResults)
    } catch (error) {
      console.error("Error searching content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  // Filter results based on content type and genre
  const filteredResults = results.filter(item => {
    // Filter by content type
    if (contentType !== "all" && item.type !== contentType) return false
    
    // Filter by genre
    if (activeFilter !== "all") {
      return item.genres.some((g: string) => g.toLowerCase() === activeFilter.toLowerCase())
    }
    
    return true
  })

  // Get unique genres from results
  const allGenres = results.flatMap(item => item.genres)
  const uniqueGenres = [...new Set(allGenres)].sort()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Search</h1>

          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Search for movies, TV shows..."
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-pulse text-xl">Searching...</div>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(value) => setContentType(value as any)}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="movie">Movies</TabsTrigger>
                    <TabsTrigger value="series">TV Series</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveFilter}>
                  <div className="overflow-x-auto">
                    <TabsList>
                      <TabsTrigger value="all">All Genres</TabsTrigger>
                      {uniqueGenres.map((genre) => (
                        <TabsTrigger key={genre} value={genre.toLowerCase()}>
                          {genre}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                </Tabs>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredResults.map((item) => (
                  <ContentCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    posterUrl={item.posterUrl}
                    year={item.year}
                    rating={item.rating}
                    genres={item.genres}
                    type={item.type}
                    seasons={item.type === "series" ? item.seasons : undefined}
                    size="sm"
                  />
                ))}
              </div>

              {filteredResults.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No results match your filters. Try adjusting your search criteria.</p>
                </div>
              )}
            </>
          ) : query ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No results found for "{query}". Try a different search term.</p>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Enter a search term to find movies and TV shows.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

