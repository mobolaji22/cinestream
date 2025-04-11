"use client"

import { useState, useEffect, useCallback, Suspense } from "react" // Add useCallback
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { getUserWatchlist, getPopularMovies } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { PlusCircle } from "lucide-react"

function ProfileFormat() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  
  const [watchlistMovies, setWatchlistMovies] = useState<any[]>([])
  const [watchlistSeries, setWatchlistSeries] = useState<any[]>([])
  const [trendingMovies, setTrendingMovies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(tabParam || "watchlist")
  const [lastRefresh, setLastRefresh] = useState(Date.now()) // Add refresh state
  
  // Create a memoized fetch function with useCallback
  const fetchWatchlistData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch watchlist data and trending movies in parallel
      const [watchlistData, trending] = await Promise.all([
        getUserWatchlist(),
        getPopularMovies()
      ]);
      
      // Separate movies and series in the watchlist
      setWatchlistMovies(watchlistData.filter(item => item.type === 'movie'))
      setWatchlistSeries(watchlistData.filter(item => item.type === 'series'))
      
      // Set trending movies
      setTrendingMovies(trending)
      
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching watchlist data:", error)
      setIsLoading(false)
    }
  }, [])
  
  // Add an effect to listen for storage events
  useEffect(() => {
    // Function to handle storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('watchlist_')) {
        // Refresh the watchlist data when localStorage changes
        setLastRefresh(Date.now());
      }
    };
    
    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !isLoading) {
      router.push("/auth/login?redirect=/profile")
      return
    }

    if (isAuthenticated) {
      fetchWatchlistData()
    }
  }, [isAuthenticated, router, fetchWatchlistData, lastRefresh]) // Add lastRefresh dependency

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-2xl">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-2xl">Please log in to view your profile</div>
        </div>
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar || "/placeholder.svg?height=80&width=80"} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">Member since {user.memberSince}</p>
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

          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="watchlist" className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">My Watchlist</h2>
                  <div className="flex gap-2">
                    <Link href="/movies">
                      <Button variant="outline" size="sm">Browse Movies</Button>
                    </Link>
                    <Link href="/series">
                      <Button variant="outline" size="sm">Browse Series</Button>
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
                        {watchlistMovies.map((movie: any) => (
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
                        {watchlistSeries.map((series: any) => (
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
                        {watchlistMovies.map((movie: any) => (
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
                        {watchlistSeries.map((series: any) => (
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
              </div>
            </TabsContent>

            <TabsContent value="history" className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {trendingMovies.slice(0, 5).map((movie: any) => (
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
                    <Button variant="secondary" size="sm">
                      Comedy
                    </Button>
                    <Button variant="outline" size="sm">
                      + Add Genre
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Content Preferences</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Email Notifications</span>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Content Language</span>
                      <Button variant="outline" size="sm">
                        English
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Subtitle Language</span>
                      <Button variant="outline" size="sm">
                        English
                      </Button>
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

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
        <ProfileFormat />
      </Suspense>
      <Footer />
    </div>
  )
}
