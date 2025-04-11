import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { Button } from "@/components/ui/button"
import { recommendedMovies, recommendedSeries } from "@/lib/mock-data"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WatchlistPage() {
  // In a real app, you would fetch the user's watchlist from an API
  const watchlistMovies = recommendedMovies.slice(0, 3)
  const watchlistSeries = recommendedSeries.slice(0, 2)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Watchlist</h1>
            <div className="flex gap-2">
              <Link href="/movies">
                <Button variant="outline">Browse Movies</Button>
              </Link>
              <Link href="/series">
                <Button variant="outline">Browse Series</Button>
              </Link>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-fit">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="series">Series</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="pt-4">
              {watchlistMovies.length > 0 || watchlistSeries.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {watchlistMovies.map((movie) => (
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
                  {watchlistSeries.map((series) => (
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
              ) : (
                <EmptyWatchlist />
              )}
            </TabsContent>

            <TabsContent value="movies" className="pt-4">
              {watchlistMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {watchlistMovies.map((movie) => (
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
              ) : (
                <EmptyWatchlist type="movies" />
              )}
            </TabsContent>

            <TabsContent value="series" className="pt-4">
              {watchlistSeries.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {watchlistSeries.map((series) => (
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
              ) : (
                <EmptyWatchlist type="series" />
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Recommended For You</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendedMovies.slice(3, 6).map((movie) => (
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
              {recommendedSeries.slice(2, 5).map((series) => (
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
        </div>
      </main>
      <Footer />
    </div>
  )
}

function EmptyWatchlist({ type = "content" }: { type?: "content" | "movies" | "series" }) {
  const browseLink = type === "movies" ? "/movies" : type === "series" ? "/series" : "/"
  const message =
    type === "movies"
      ? "Add movies to your watchlist to keep track of what you want to watch."
      : type === "series"
        ? "Add TV series to your watchlist to keep track of what you want to watch."
        : "Add movies and shows to your watchlist to keep track of what you want to watch."

  const buttonText = type === "movies" ? "Browse Movies" : type === "series" ? "Browse Series" : "Browse Content"

  return (
    <div className="text-center py-12 space-y-4">
      <div className="flex justify-center">
        <PlusCircle className="h-16 w-16 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium">Your watchlist is empty</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{message}</p>
      <Link href={browseLink}>
        <Button>{buttonText}</Button>
      </Link>
    </div>
  )
}

