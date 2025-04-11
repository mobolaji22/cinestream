"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { getSeriesDetails, getSeriesSeasonDetails } from "@/lib/api"

interface SeriesPlayerPageProps {
  params: {
    id: string
    season: string
    episode: string
  }
}

export default function SeriesPlayerPage() {
  const router = useRouter()
  // Use the useParams hook instead of accessing params directly
  const params = useParams()
  const id = params.id as string
  const season = params.season as string
  const episode = params.episode as string
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [volume, setVolume] = useState(1)
  const [series, setSeries] = useState<any>(null)
  const [currentSeason, setCurrentSeason] = useState<any>(null)
  const [currentEpisode, setCurrentEpisode] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nextEpisode, setNextEpisode] = useState<any>(null)

  // Parse season and episode numbers
  const seasonNumber = Number.parseInt(season.replace("s", ""), 10)
  const episodeNumber = Number.parseInt(episode.replace("e", ""), 10)

  // Video URL with fallback
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

  // Fetch series data
  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        // Fetch series details
        const seriesData = await getSeriesDetails(id)
        setSeries(seriesData)
        
        // Fetch season details
        const seasonData = await getSeriesSeasonDetails(id, seasonNumber)
        setCurrentSeason(seasonData)
        
        // Find current episode
        const episodeData = seasonData.episodes.find((e: any) => e.number === episodeNumber) || seasonData.episodes[0]
        setCurrentEpisode(episodeData)
        
        // Find next episode
        const nextEpisodeIndex = seasonData.episodes.findIndex((e: any) => e.number === episodeNumber) + 1
        if (nextEpisodeIndex < seasonData.episodes.length) {
          setNextEpisode(seasonData.episodes[nextEpisodeIndex])
        } else if (seasonNumber < seriesData.seasons.length) {
          // Check if there's a next season
          const nextSeasonData = seriesData.seasons.find((s: any) => s.number === seasonNumber + 1)
          if (nextSeasonData && nextSeasonData.episodes.length > 0) {
            setNextEpisode({
              ...nextSeasonData.episodes[0],
              nextSeason: true,
              seasonNumber: seasonNumber + 1
            })
          }
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching series data:", error)
        setIsLoading(false)
      }
    }
    
    fetchSeriesData()
  }, [id, seasonNumber, episodeNumber])

  // Set up video event listeners
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
      // Auto-play next episode logic can go here if needed
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("ended", handleEnded)

    // Ensure video is paused on component mount
    video.pause()
    setIsPlaying(false)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("ended", handleEnded)
    }
  }, [])

  // Handle mouse movement to show/hide controls
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

  // Play/Pause functionality
  const handlePlayPause = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (isPlaying) {
        video.pause()
        setIsPlaying(false)
      } else {
        await video.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error)
      setIsPlaying(false)
    }
  }

  // Mute toggle functionality
  const handleMuteToggle = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  // Volume change functionality
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  // Seek functionality
  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  // Fullscreen toggle functionality
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

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Handle navigation to next episode
  const handleNextEpisode = () => {
    if (!nextEpisode) return
    
    if (nextEpisode.nextSeason) {
      router.push(`/watch/${id}/s${nextEpisode.seasonNumber}/e${nextEpisode.number}`)
    } else {
      router.push(`/watch/${id}/s${seasonNumber}/e${nextEpisode.number}`)
    }
  }

  // Handle back navigation
  const handleBack = () => {
    router.push(`/series/${id}`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="animate-pulse text-2xl text-white">Loading episode...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-black" onMouseMove={handleMouseMove}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={currentEpisode?.thumbnailUrl || series?.backdropUrl}
        onClick={handlePlayPause}
      >
        <source src={videoUrl} type="video/mp4" />
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
              <h1 className="text-xl font-medium text-white">{series?.title || "Series"}</h1>
              <p className="text-sm text-gray-300">
                Season {seasonNumber} • Episode {episodeNumber}: {currentEpisode?.title || "Episode"}
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
                  {nextEpisode && (
                    <Button variant="ghost" size="icon" className="text-white" onClick={handleNextEpisode}>
                      <SkipForward className="h-5 w-5" />
                      <span className="sr-only">Next Episode</span>
                    </Button>
                  )}

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

