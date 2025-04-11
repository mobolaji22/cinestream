import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { recommendedSeries, trendingSeries } from "@/lib/mock-data"

export default function SeriesPage() {
  // Combine all series
  const allSeries = [...recommendedSeries, ...trendingSeries]

  // Remove duplicates
  const uniqueSeries = allSeries.filter((series, index, self) => index === self.findIndex((s) => s.id === series.id))

  // Get unique genres
  const allGenres = uniqueSeries.flatMap((series) => series.genres)
  const uniqueGenres = [...new Set(allGenres)].sort()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">TV Series</h1>

          <Tabs defaultValue="all" className="w-full">
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

            <TabsContent value="all" className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {uniqueSeries.map((series) => (
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
            </TabsContent>

            {uniqueGenres.map((genre) => (
              <TabsContent key={genre} value={genre.toLowerCase()} className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {uniqueSeries
                    .filter((series) => series.genres.includes(genre))
                    .map((series) => (
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
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

