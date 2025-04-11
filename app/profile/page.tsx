import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MovieCard } from "@/components/movie-card"
import { recommendedMovies, trendingMovies } from "@/lib/mock-data"

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt="John Doe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">John Doe</h1>
              <p className="text-muted-foreground">Member since January 2023</p>
              <div className="flex gap-2">
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <Tabs defaultValue="watchlist" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="watchlist" className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recommendedMovies.slice(0, 5).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterUrl={movie.posterUrl}
                    year={movie.year}
                    rating={movie.rating}
                    genres={movie.genres}
                    size="sm"
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {trendingMovies.slice(0, 5).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterUrl={movie.posterUrl}
                    year={movie.year}
                    rating={movie.rating}
                    genres={movie.genres}
                    size="sm"
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Favorite Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm">
                      Action
                    </Button>
                    <Button variant="secondary" size="sm">
                      Sci-Fi
                    </Button>
                    <Button variant="secondary" size="sm">
                      Thriller
                    </Button>
                    <Button variant="outline" size="sm">
                      + Add Genre
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Viewing Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Autoplay Trailers</span>
                      <Button variant="outline" size="sm">
                        On
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Subtitles</span>
                      <Button variant="outline" size="sm">
                        Off
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Preferred Language</span>
                      <Button variant="outline" size="sm">
                        English
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Viewing Activity</h3>
                  <div className="bg-card p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Total Watch Time</span>
                      <span className="text-sm">42 hours</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Movies Watched</span>
                      <span className="text-sm">18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Rating</span>
                      <span className="text-sm">4.2/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

