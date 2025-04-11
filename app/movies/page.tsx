import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { recommendedMovies, trendingMovies, newReleases } from "@/lib/mock-data"

export default function MoviesPage() {
  // Combine all movies
  const allMovies = [...recommendedMovies, ...trendingMovies, ...newReleases]

  // Remove duplicates
  const uniqueMovies = allMovies.filter((movie, index, self) => index === self.findIndex((m) => m.id === movie.id))

  // Get unique genres
  const allGenres = uniqueMovies.flatMap((movie) => movie.genres)
  const uniqueGenres = [...new Set(allGenres)].sort()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Movies</h1>

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
                {uniqueMovies.map((movie) => (
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
            </TabsContent>

            {uniqueGenres.map((genre) => (
              <TabsContent key={genre} value={genre.toLowerCase()} className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {uniqueMovies
                    .filter((movie) => movie.genres.includes(genre))
                    .map((movie) => (
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
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

