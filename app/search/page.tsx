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
import { getAllContent } from "@/lib/mock-data"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState("all")
  const [contentType, setContentType] = useState<"all" | "movie" | "series">("all")

  // Get all content
  const allContent = getAllContent()

  useEffect(() => {
    if (query) {
      filterResults(query, contentType, activeFilter)
    } else {
      setResults([])
    }
  }, [query, contentType])

  const filterResults = (searchTerm: string, type: string, genre: string) => {
    let filtered = allContent.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by content type
    if (type !== "all") {
      filtered = filtered.filter((item) => item.type === type)
    }

    // Filter by genre
    if (genre !== "all") {
      filtered = filtered.filter((item) => item.genres.some((g) => g.toLowerCase() === genre.toLowerCase()))
    }

    setResults(filtered)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    filterResults(searchQuery, contentType, activeFilter)
  }

  const handleContentTypeChange = (value: "all" | "movie" | "series") => {
    setContentType(value)
    filterResults(query, value, activeFilter)
  }

  const handleGenreFilter = (genre: string) => {
    setActiveFilter(genre)
    filterResults(query, contentType, genre)
  }

  // Get unique genres from results
  const genres = results.length > 0 ? [...new Set(results.flatMap((item) => item.genres))].sort() : []

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Search</h1>

          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Search for movies & series..."
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>

          {query && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">
                  {results.length} results for "{query}"
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Tabs
                    defaultValue="all"
                    value={contentType}
                    onValueChange={(value) => handleContentTypeChange(value as "all" | "movie" | "series")}
                    className="w-fit"
                  >
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="movie">Movies</TabsTrigger>
                      <TabsTrigger value="series">Series</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {genres.length > 0 && (
                    <Tabs defaultValue="all" className="w-fit">
                      <TabsList className="overflow-x-auto">
                        <TabsTrigger value="all" onClick={() => handleGenreFilter("all")}>
                          All Genres
                        </TabsTrigger>
                        {genres.slice(0, 3).map((genre) => (
                          <TabsTrigger key={genre} value={genre.toLowerCase()} onClick={() => handleGenreFilter(genre)}>
                            {genre}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  )}
                </div>
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.map((item) => (
                    <ContentCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      posterUrl={item.posterUrl}
                      year={item.year}
                      rating={item.rating}
                      genres={item.genres}
                      type={item.type}
                      seasons={item.seasons}
                      size="sm"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              )}
            </>
          )}

          {!query && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Popular Searches</h2>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setSearchQuery("action")}>
                    Action
                  </Button>
                  <Button variant="outline" onClick={() => setSearchQuery("sci-fi")}>
                    Sci-Fi
                  </Button>
                  <Button variant="outline" onClick={() => setSearchQuery("drama")}>
                    Drama
                  </Button>
                  <Button variant="outline" onClick={() => setSearchQuery("2021")}>
                    2021 Releases
                  </Button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Trending Content</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {allContent.slice(0, 10).map((item) => (
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
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

