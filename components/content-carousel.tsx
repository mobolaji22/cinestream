"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentCard } from "@/components/content-card"

interface Content {
  id: string
  title: string
  posterUrl: string
  year: number
  rating: string
  genres: string[]
  type: "movie" | "series"
  seasons?: number
}

interface ContentCarouselProps {
  title: string
  content: Content[]
  size?: "sm" | "md" | "lg"
}

export function ContentCarousel({ title, content, size = "md" }: ContentCarouselProps) {
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
        {content.map((item) => (
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
            size={size}
          />
        ))}
      </div>
    </div>
  )
}

