"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MovieCard } from "@/components/movie-card"

interface Movie {
  id: string
  title: string
  posterUrl: string
  year: number
  rating: string
  genres: string[]
}

interface MovieCarouselProps {
  title: string
  movies: Movie[]
  size?: "sm" | "md" | "lg"
}

export function MovieCarousel({ title, movies, size = "md" }: MovieCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { current } = carouselRef
      const scrollAmount = direction === "left" ? -current.clientWidth * 0.75 : current.clientWidth * 0.75

      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => scroll("left")}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Scroll left</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => scroll("right")}>
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </div>
      </div>
      <div ref={carouselRef} className="carousel flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterUrl={movie.posterUrl}
            year={movie.year}
            rating={movie.rating}
            genres={movie.genres}
            size={size}
          />
        ))}
      </div>
    </div>
  )
}

