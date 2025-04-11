"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { seriesDetails } from "@/lib/mock-data"

interface SeriesPlayerPageProps {
  params: {
    id: string
    season: string
    episode: string
  }
}

// Mock function to simulate fetching content by ID.  Replace with your actual data fetching logic.
const getContentById = (id: string) => {
  // In a real application, you would fetch data from an API or database here.
  // This is just a placeholder.
  return null
}

export default function SeriesPlayerPage({ params }: SeriesPlayerPageProps) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [volume, setVolume] = useState(1)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Parse season and episode numbers
  const seasonNumber = Number.parseInt(params.season.replace("s", ""), 10)
  const episodeNumber = Number.parseInt(params.episode.replace("e", ""), 10)

  // Get series details with fallback to default
  const series = params.id === seriesDetails.id ? seriesDetails : getContentById(params.id) || seriesDetails

  // Check if seasons array exists and has content
  const hasSeasons = Array.isArray(series.seasons) && series.seasons.length > 0

  // Get current season with fallback
  const currentSeason = hasSeasons
    ? series.seasons.find((s) => s.number === seasonNumber) || series.seasons[0]
    : { number: 1, year: series.year, episodes: [] }

  // Check if episodes array exists and has content
  const hasEpisodes = Array.isArray(currentSeason.episodes) && currentSeason.episodes.length > 0

  // Get current episode with fallback
  const currentEpisode = hasEpisodes
    ? currentSeason.episodes.find((e) => e.number === episodeNumber) || currentSeason.episodes[0]
    : {
        number: 1,
        title: "Episode 1",
        duration: "30m",
        description: "No description available",
        thumbnailUrl: "/placeholder.svg?height=180&width=320",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      }

  // Get next episode info
  const hasNextEpisode = hasEpisodes && currentSeason.episodes.some((e) => e.number === episodeNumber + 1)
  const hasNextSeason = hasSeasons && series.seasons.some((s) => s.number === seasonNumber + 1)

  const getNextEpisodeUrl = () => {
    if (hasNextEpisode) {
      return `/watch/${params.id}/s${seasonNumber}/e${episodeNumber + 1}`
    } else if (hasNextSeason) {
      return `/watch/${params.id}/s${seasonNumber + 1}/e1`
    }
    return `/series/${params.id}`
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      // Auto-navigate to next episode
      if (hasNextEpisode || hasNextSeason) {
        setTimeout(() => {
          router.push(getNextEpisodeUrl())
        }, 5000)
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("ended", handleEnded)
    }
  }, [hasNextEpisode, hasNextSeason, router])

  const handlePlayPause = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (isPlaying) {
        video.pause()
        setIsPlaying(false)
      } else {
        // Play returns a promise that might be rejected
        await video.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error)
      // Make sure UI state matches actual video state
      setIsPlaying(false)
    }
  }

  const handleMuteToggle = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Ensure video is paused on component mount
    video.pause()
    setIsPlaying(false)

    // Add a canplay event listener
    const handleCanPlay = () => {
      console.log("Video can play now")
    }

    video.addEventListener("canplay", handleCanPlay)

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
    }
  }, [])

  const handleBack = () => {
    router.push(`/series/${params.id}`)
  }

  const handleNextEpisode = () => {
    if (hasNextEpisode || hasNextSeason) {
      router.push(getNextEpisodeUrl())
    }
  }

  return (
    <div className="relative w-full h-screen bg-black" onMouseMove={handleMouseMove}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={currentEpisode.thumbnailUrl || series.backdropUrl}
        onClick={handlePlayPause}
        onError={(e) => console.error("Video error:", e)}
      >
        <source src={currentEpisode.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {showControls && (
        <>
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent">
            <Button variant="ghost" size="icon" className="text-white" onClick={handleBack}>
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-medium text-white">{series.title}</h1>
              <p className="text-sm text-gray-300">
                S{seasonNumber} E{episodeNumber}: {currentEpisode.title}
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="space-y-4">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="text-white" onClick={handlePlayPause}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
                  </Button>

                  {(hasNextEpisode || hasNextSeason) && (
                    <Button variant="ghost" size="icon" className="text-white" onClick={handleNextEpisode}>
                      <SkipForward className="h-6 w-6" />
                      <span className="sr-only">Next Episode</span>
                    </Button>
                  )}

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white" onClick={handleMuteToggle}>
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
                    </Button>

                    <div className="w-24 hidden md:block">
                      <Slider value={[isMuted ? 0 : volume]} max={1} step={0.1} onValueChange={handleVolumeChange} />
                    </div>
                  </div>

                  <div className="text-sm text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="text-white">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                  </Button>

                  <Button variant="ghost" size="icon" className="text-white" onClick={handleFullscreenToggle}>
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    <span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

