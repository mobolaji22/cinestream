import Image from "next/image"
import Link from "next/link"
import { Play, Plus, Film, Tv } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeroBannerProps {
  content: {
    id: string
    title: string
    type: "movie" | "series"
    backdropUrl: string
    description: string
    year: number
    rating: string
    duration?: string
    seasons?: number
    genres: string[]
  }
}

export function HeroBanner({ content }: HeroBannerProps) {
  const contentPath = content.type === "movie" ? `/movies/${content.id}` : `/series/${content.id}`
  const watchPath = content.type === "movie" ? `/watch/${content.id}` : `/watch/${content.id}/s1/e1`

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px]">
      <Image
        src={content.backdropUrl || "/placeholder.svg"}
        alt={content.title}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
      <div className="absolute inset-0 hero-gradient" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            {content.type === "movie" ? (
              <>
                <Film className="h-4 w-4" />
                <span>Movie</span>
              </>
            ) : (
              <>
                <Tv className="h-4 w-4" />
                <span>Series</span>
              </>
            )}
          </Badge>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-2xl">{content.title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="outline" className="font-normal">
            {content.rating}
          </Badge>
          <span>{content.year}</span>
          {content.type === "movie" && content.duration && <span>{content.duration}</span>}
          {content.type === "series" && content.seasons && (
            <span>
              {content.seasons} {content.seasons === 1 ? "Season" : "Seasons"}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            {content.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground max-w-2xl line-clamp-3 md:line-clamp-4">{content.description}</p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href={watchPath}>
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" /> Play Now
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="gap-2">
            <Plus className="h-5 w-5" /> Add to Watchlist
          </Button>
        </div>
      </div>
    </div>
  )
}

