'use client'

import Image from "next/image"
import Link from "next/link"
import { Play, Plus, Star, Clock, Calendar, Film } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentCarousel } from "@/components/content-carousel"
import { getMovieDetails } from "@/lib/api"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

interface MovieDetailPageProps {
  params: {
    id: string
  }
}

export default function MovieDetailPage() {
  // Use the useParams hook instead of accessing params directly
  const params = useParams()
  const id = params.id as string
  
  const [movie, setMovie] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieData = await getMovieDetails(id)
        setMovie(movieData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching movie details:", error)
        setIsLoading(false)
      }
    }

    fetchMovieDetails()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-2xl">Loading movie details...</div>
        </div>
      </div>
    )
  }

  // Ensure we have all required properties with defaults
  const movieWithDefaults = {
    ...movie,
    genres: movie?.genres || [],
    cast: movie?.cast || [],
    director: movie?.director || "Unknown",
    description: movie?.description || "No description available.",
    similarMovies: movie?.similarMovies || [],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="relative w-full h-[50vh] md:h-[60vh]">
          <Image
            src={movieWithDefaults.backdropUrl || "/placeholder.svg"}
            alt={movieWithDefaults.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        </div>

        <div className="container px-4 -mt-32 md:-mt-40 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="hidden md:block">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-xl">
                <Image
                  src={movieWithDefaults.posterUrl || "/placeholder.svg"}
                  alt={movieWithDefaults.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Film className="h-4 w-4" />
                  <span>Movie</span>
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{movieWithDefaults.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Badge variant="outline" className="font-normal">
                  {movieWithDefaults.rating}
                </Badge>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{movieWithDefaults.year}</span>
                </div>
                {movieWithDefaults.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{movieWithDefaults.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>8.4/10</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {movieWithDefaults.genres.map((genre: string) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href={`/watch/${movieWithDefaults.id}`}>
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5" /> Watch Now
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2">
                  <Plus className="h-5 w-5" /> Add to Watchlist
                </Button>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-4">
                  <p className="text-muted-foreground">{movieWithDefaults.description}</p>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Director</h3>
                      <p className="text-sm text-muted-foreground">{movieWithDefaults.director}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Release Date</h3>
                      <p className="text-sm text-muted-foreground">{movieWithDefaults.year}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="cast" className="pt-4">
                  {movieWithDefaults.cast.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {movieWithDefaults.cast.map((actor: string) => (
                        <div key={actor} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-lg font-medium">{actor.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{actor}</p>
                            <p className="text-xs text-muted-foreground">Character Name</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No cast information available.</p>
                  )}
                </TabsContent>
                <TabsContent value="reviews" className="pt-4">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium">JD</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">John Doe</p>
                          <div className="flex items-center">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < 4 ? "text-yellow-500" : "text-muted"}`} />
                              ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        A visually stunning and immersive film. The director has created a masterpiece that captures the
                        essence of the story while making it accessible to new audiences.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium">JS</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Jane Smith</p>
                          <div className="flex items-center">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < 5 ? "text-yellow-500" : "text-muted"}`} />
                              ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The cinematography and sound design are incredible. The performances bring depth to the
                        characters. Highly recommended!
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="mt-16">
            {movieWithDefaults.similarMovies.length > 0 ? (
              <ContentCarousel title="Similar Movies" content={movieWithDefaults.similarMovies} />
            ) : (
              <div className="text-center py-8">
                <h3 className="text-xl font-medium mb-2">No similar movies found</h3>
                <p className="text-muted-foreground">Check out our other recommendations on the home page.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

