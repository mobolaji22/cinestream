"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Play, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

interface MovieCardProps {
  id: string
  title: string
  posterUrl: string
  year: number
  rating: string
  genres: string[]
  size?: "sm" | "md" | "lg"
}

export function MovieCard({ id, title, posterUrl, year, rating, genres, size = "md" }: MovieCardProps) {
  const sizeClasses = {
    sm: "w-32 md:w-40",
    md: "w-40 md:w-48",
    lg: "w-48 md:w-56",
  }

  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false)

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAddingToWatchlist(true)

    // Simulate API call
    setTimeout(() => {
      setIsAddingToWatchlist(false)
      toast({
        title: "Added to watchlist",
        description: `${title} has been added to your watchlist.`,
      })
    }, 500)
  }

  return (
    <Link href={`/movies/${id}`}>
      <Card className={`movie-card overflow-hidden border-0 bg-transparent ${sizeClasses[size]}`}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-md">
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300"
            sizes={`(max-width: 768px) ${size === "sm" ? "128px" : size === "md" ? "160px" : "192px"}, ${size === "sm" ? "160px" : size === "md" ? "192px" : "224px"}`}
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex flex-col gap-2">
              <Button size="sm" className="rounded-full">
                <Play className="h-4 w-4 mr-1" /> Play
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={handleAddToWatchlist}
                disabled={isAddingToWatchlist}
              >
                <Plus className="h-4 w-4 mr-1" /> Watchlist
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-2">
          <h3 className="font-medium text-sm truncate">{title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{year}</span>
            {rating && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {rating}
              </Badge>
            )}
          </div>
          {genres && genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {genres.slice(0, 1).map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs px-1.5 py-0">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

