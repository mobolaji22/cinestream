'use client'

import Image from "next/image"
import Link from "next/link"
import { Play, Plus, Star, Calendar, Tv } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentCarousel } from "@/components/content-carousel"
import { getSeriesDetails } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

interface SeriesDetailPageProps {
  params: {
    id: string
  }
}

export default function SeriesDetailPage() {
  // Use the useParams hook instead of accessing params directly
  const params = useParams()
  const id = params.id as string
  
  const [series, setSeries] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      try {
        const seriesData = await getSeriesDetails(id)
        setSeries(seriesData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching series details:", error)
        setIsLoading(false)
      }
    }

    fetchSeriesDetails()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-2xl">Loading series details...</div>
        </div>
      </div>
    )
  }

  // Ensure we have all required properties with defaults
  const seriesWithDefaults = {
    ...series,
    genres: series?.genres || [],
    cast: series?.cast || [],
    creators: series?.creators || ["Unknown"],
    description: series?.description || "No description available.",
    seasons: series?.seasons || [],
    similarSeries: series?.similarSeries || [],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="relative w-full h-[50vh] md:h-[60vh]">
          <Image
            src={seriesWithDefaults.backdropUrl || "/placeholder.svg"}
            alt={seriesWithDefaults.title}
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
                  src={seriesWithDefaults.posterUrl || "/placeholder.svg"}
                  alt={seriesWithDefaults.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tv className="h-4 w-4" />
                  <span>Series</span>
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{seriesWithDefaults.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Badge variant="outline" className="font-normal">
                  {seriesWithDefaults.rating}
                </Badge>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{seriesWithDefaults.year}</span>
                </div>
                {typeof seriesWithDefaults.seasons === "number" ? (
                  <div className="flex items-center gap-1">
                    <span>
                      {seriesWithDefaults.seasons} {seriesWithDefaults.seasons === 1 ? "Season" : "Seasons"}
                    </span>
                  </div>
                ) : seriesWithDefaults.seasons.length > 0 ? (
                  <div className="flex items-center gap-1">
                    <span>
                      {seriesWithDefaults.seasons.length}{" "}
                      {seriesWithDefaults.seasons.length === 1 ? "Season" : "Seasons"}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>8.7/10</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {seriesWithDefaults.genres.map((genre: string) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href={`/watch/${seriesWithDefaults.id}/s1/e1`}>
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
                  <TabsTrigger value="episodes">Episodes</TabsTrigger>
                  <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-4">
                  <p className="text-muted-foreground">{seriesWithDefaults.description}</p>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Creators</h3>
                      <p className="text-sm text-muted-foreground">
                        {seriesWithDefaults.creators ? seriesWithDefaults.creators.join(", ") : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">First Air Date</h3>
                      <p className="text-sm text-muted-foreground">{seriesWithDefaults.year}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="episodes" className="pt-4">
                  {Array.isArray(seriesWithDefaults.seasons) && seriesWithDefaults.seasons.length > 0 ? (
                    <Tabs defaultValue="1" className="w-full">
                      <TabsList className="mb-4">
                        {seriesWithDefaults.seasons.map((season: { number: number }) => (
                          <TabsTrigger key={season.number} value={season.number.toString()}>
                            Season {season.number}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {seriesWithDefaults.seasons.map((season: { number: number, episodes: any[] }) => (
                        <TabsContent key={season.number} value={season.number.toString()} className="space-y-4">
                          {season.episodes.map((episode: { number: number, title: string, description: string, thumbnailUrl: string, duration: string }) => (
                            <Link
                              key={episode.number}
                              href={`/watch/${seriesWithDefaults.id}/s${season.number}/e${episode.number}`}
                            >
                              <Card className="overflow-hidden hover:bg-secondary/50 transition-colors">
                                <div className="flex flex-col md:flex-row">
                                  <div className="relative w-full md:w-48 h-32">
                                    <Image
                                      src={episode.thumbnailUrl || "/placeholder.svg"}
                                      alt={episode.title}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 100vw, 192px"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/60 transition-opacity">
                                      <Play className="h-12 w-12" />
                                    </div>
                                  </div>
                                  <CardContent className="p-4 flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <h3 className="font-medium">
                                        {episode.number}. {episode.title}
                                      </h3>
                                      <span className="text-sm text-muted-foreground">{episode.duration}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{episode.description}</p>
                                  </CardContent>
                                </div>
                              </Card>
                            </Link>
                          ))}
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <p className="text-muted-foreground">No episode information available.</p>
                  )}
                </TabsContent>
                <TabsContent value="cast" className="pt-4">
                  {seriesWithDefaults.cast && seriesWithDefaults.cast.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {seriesWithDefaults.cast.map((actor: string) => (
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
              </Tabs>
            </div>
          </div>

          <div className="mt-16">
            {seriesWithDefaults.similarSeries && seriesWithDefaults.similarSeries.length > 0 ? (
              <ContentCarousel title="Similar Series" content={seriesWithDefaults.similarSeries} />
            ) : (
              <div className="text-center py-8">
                <h3 className="text-xl font-medium mb-2">No similar series found</h3>
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

