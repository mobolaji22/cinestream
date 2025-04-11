"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, Menu, X, Film, Tv, User, Bookmark, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth() // Actually use the auth context

  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background to-transparent">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-6">
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-background">
                <div className="flex flex-col gap-4 mt-8">
                  <Link
                    href="/"
                    className={`text-lg font-medium ${pathname === "/" ? "text-primary" : "text-foreground"}`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/movies"
                    className={`text-lg font-medium ${
                      pathname.startsWith("/movies") ? "text-primary" : "text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Film className="h-4 w-4" />
                      <span>Movies</span>
                    </div>
                  </Link>
                  <Link
                    href="/series"
                    className={`text-lg font-medium ${
                      pathname.startsWith("/series") ? "text-primary" : "text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Tv className="h-4 w-4" />
                      <span>TV Series</span>
                    </div>
                  </Link>
                  {isAuthenticated ? (
                    <Link
                      href="/profile"
                      className={`text-lg font-medium ${pathname === "/profile" ? "text-primary" : "text-foreground"}`}
                    >
                      My Profile
                    </Link>
                  ) : (
                    <Link
                      href="/auth/login"
                      className={`text-lg font-medium ${pathname === "/auth/login" ? "text-primary" : "text-foreground"}`}
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ) : null}

          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary">CineStream</span>
          </Link>

          {!isMobile && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className={`text-sm font-medium ${pathname === "/" ? "text-primary" : "text-foreground"}`}>
                Home
              </Link>
              <Link
                href="/movies"
                className={`text-sm font-medium ${pathname.startsWith("/movies") ? "text-primary" : "text-foreground"}`}
              >
                <div className="flex items-center gap-1">
                  <Film className="h-4 w-4" />
                  <span>Movies</span>
                </div>
              </Link>
              <Link
                href="/series"
                className={`text-sm font-medium ${pathname.startsWith("/series") ? "text-primary" : "text-foreground"}`}
              >
                <div className="flex items-center gap-1">
                  <Tv className="h-4 w-4" />
                  <span>TV Series</span>
                </div>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="relative">
              <input
                type="search"
                placeholder="Search movies & series..."
                className="w-full md:w-64 h-9 px-3 py-2 bg-secondary rounded-md text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close search</span>
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" className="text-foreground" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.avatar || "/placeholder.svg?height=32&width=32"} alt={user?.name || "User"} />
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    {/* <Link href="/profile">
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>Watchlist</span>
                    </Link> */}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

