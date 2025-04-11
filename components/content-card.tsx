"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Plus, Film, Tv, Check, Loader2 } from "lucide-react" // Add Loader2
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "@/lib/api"

interface ContentCardProps {
  id: string
  title: string
  posterUrl: string
  year: number
  rating: string
  genres: string[]
  type: "movie" | "series"
  seasons?: number
  size?: "sm" | "md" | "lg"
}

export function ContentCard({
  id,
  title,
  posterUrl,
  year,
  rating,
  genres,
  type,
  seasons,
  size = "md",
}: ContentCardProps) {
  const sizeClasses = {
    sm: "w-32 md:w-40",
    md: "w-40 md:w-48",
    lg: "w-48 md:w-56",
  }

  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false)
  const [isRemovingFromWatchlist, setIsRemovingFromWatchlist] = useState(false)
  const [isWatchlisted, setIsWatchlisted] = useState(false)

  // Check if the content is already in the watchlist
  useEffect(() => {
    const checkWatchlist = async () => {
      const inWatchlist = await isInWatchlist(id)
      setIsWatchlisted(inWatchlist)
    }
    
    checkWatchlist()
  }, [id])

  // In the handleAddToWatchlist function
  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAddingToWatchlist(true)
  
    try {
      // Call the API to add to watchlist
      const success = await addToWatchlist(id, type)
      
      if (success) {
        setIsWatchlisted(true) // Update local state immediately
        toast({
          title: "Added to watchlist",
          description: `${title} has been added to your watchlist.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add to watchlist. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error)
      toast({
        title: "Error",
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAddingToWatchlist(false)
    }
  }

  // Handle removing from watchlist
  const handleRemoveFromWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsRemovingFromWatchlist(true)
  
    try {
      // Call the API to remove from watchlist
      const success = await removeFromWatchlist(id)
      
      if (success) {
        setIsWatchlisted(false)
        toast({
          title: "Removed from watchlist",
          description: `${title} has been removed from your watchlist.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to remove from watchlist. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error)
      toast({
        title: "Error",
        description: "Failed to remove from watchlist. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRemovingFromWatchlist(false)
    }
  }

  const contentPath = type === "movie" ? `/movies/${id}` : `/series/${id}`

  return (
    <Link href={contentPath}>
      <Card className={`content-card overflow-hidden border-0 bg-transparent ${sizeClasses[size]}`}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-md">
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300"
            sizes={`(max-width: 768px) ${size === "sm" ? "128px" : size === "md" ? "160px" : "192px"}, ${size === "sm" ? "160px" : size === "md" ? "192px" : "224px"}`}
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex items-center gap-1">
              {type === "movie" ? (
                <>
                  <Film className="h-3 w-3" />
                  <span className="sr-only md:not-sr-only">Movie</span>
                </>
              ) : (
                <>
                  <Tv className="h-3 w-3" />
                  <span className="sr-only md:not-sr-only">Series</span>
                </>
              )}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex flex-col gap-2">
              <Button size="sm" className="rounded-full">
                <Play className="h-4 w-4 mr-1" /> Play
              </Button>
              
              {isWatchlisted ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full"
                  onClick={handleRemoveFromWatchlist}
                  disabled={isRemovingFromWatchlist}
                >
                  {isRemovingFromWatchlist ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  In Watchlist
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={handleAddToWatchlist}
                  disabled={isAddingToWatchlist}
                >
                  {isAddingToWatchlist ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Watchlist
                </Button>
              )}
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
          <div className="flex flex-wrap gap-1 mt-1 justify-between">
            {genres && genres.length > 0 && (
              <Badge key={genres[0]} variant="secondary" className="text-xs px-1.5 py-0">
                {genres[0]}
              </Badge>
            )}
            {type === "series" && seasons && (
              <span className="text-xs text-muted-foreground">
                {/* Check if seasons is a number or an array and handle accordingly */}
                {typeof seasons === 'number' 
                  ? `${seasons} ${seasons === 1 ? "Season" : "Seasons"}`
                  : Array.isArray(seasons) 
                    ? `${seasons.length} ${seasons.length === 1 ? "Season" : "Seasons"}`
                    : "Seasons"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

