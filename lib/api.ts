import axios from 'axios';

// Define content types
export interface MovieData {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  year: number | string;
  rating: string;
  genres: string[];
  description: string;
  duration?: string;
  type: 'movie';
  director?: string;
  cast?: string[];
  similarMovies?: MovieData[];
}

export interface Episode {
  number: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface SeriesData {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  year: number | string;
  rating: string;
  genres: string[];
  description: string;
  seasons: Season[] | number; // Can be either a number or an array of Season objects
  type: 'series';
  creators?: string[];
  cast?: string[];
  similarSeries?: SeriesData[];
}

// Create an axios instance with default config for TMDB
const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
  },
  headers: {
    'Content-Type': 'application/json',
  }
});

// Helper function to format movie data
const formatMovieData = (movie: any): MovieData => ({
  id: movie.id.toString(),
  title: movie.title,
  posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg',
  backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '/placeholder.svg',
  year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
  rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
  genres: movie.genres ? movie.genres.map((g: any) => g.name) : [],
  description: movie.overview || 'No description available.',
  duration: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A',
  type: 'movie'
});

// Helper function to format TV series data
const formatSeriesData = (series: any): SeriesData => ({
  id: series.id.toString(),
  title: series.name,
  posterUrl: series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : '/placeholder.svg',
  backdropUrl: series.backdrop_path ? `https://image.tmdb.org/t/p/original${series.backdrop_path}` : '/placeholder.svg',
  year: series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'Unknown',
  rating: series.vote_average ? series.vote_average.toFixed(1) : 'N/A',
  genres: series.genres ? series.genres.map((g: any) => g.name) : [],
  description: series.overview || 'No description available.',
  seasons: series.number_of_seasons || 0,
  type: 'series'
});

// API functions
export const getPopularMovies = async () => {
  try {
    const response = await tmdbApi.get('/movie/popular');
    return response.data.results.map(formatMovieData);
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

export const getTopRatedMovies = async () => {
  try {
    const response = await tmdbApi.get('/movie/top_rated');
    return response.data.results.map(formatMovieData);
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    // Return empty array instead of throwing
    return [];
  }
};

export const getMovieDetails = async (id: string) => {
  try {
    const response = await tmdbApi.get(`/movie/${id}?append_to_response=credits,similar`);
    const movieData = formatMovieData(response.data);
    
    // Add additional details
    return {
      ...movieData,
      director: response.data.credits?.crew?.find((person: any) => person.job === 'Director')?.name || 'Unknown',
      cast: response.data.credits?.cast?.slice(0, 10).map((person: any) => person.name) || [],
      similarMovies: response.data.similar?.results?.slice(0, 6).map(formatMovieData) || []
    };
  } catch (error) {
    console.error(`Error fetching movie details for ID ${id}:`, error);
    // Return a minimal movie object instead of throwing
    return {
      id,
      title: 'Movie Not Found',
      description: 'Unable to load movie details. Please try again later.',
      posterUrl: '/placeholder.svg',
      backdropUrl: '/placeholder.svg',
      year: 'Unknown',
      rating: 'N/A',
      genres: [],
      cast: [],
      director: 'Unknown',
      similarMovies: [],
      type: 'movie'
    };
  }
};

export const getPopularSeries = async () => {
  try {
    const response = await tmdbApi.get('/tv/popular');
    return response.data.results.map(formatSeriesData);
  } catch (error) {
    console.error('Error fetching popular series:', error);
    // Return empty array instead of throwing
    return [];
  }
};

export const getTopRatedSeries = async () => {
  try {
    const response = await tmdbApi.get('/tv/top_rated');
    return response.data.results.map(formatSeriesData);
  } catch (error) {
    console.error('Error fetching top rated series:', error);
    // Return empty array instead of throwing
    return [];
  }
};

export const getSeriesDetails = async (id: string) => {
  try {
    const response = await tmdbApi.get(`/tv/${id}?append_to_response=credits,similar`);
    const seriesData = formatSeriesData(response.data);
    
    // Get season details
    const seasons = [];
    for (let i = 1; i <= response.data.number_of_seasons; i++) {
      try {
        const seasonResponse = await tmdbApi.get(`/tv/${id}/season/${i}`);
        seasons.push({
          number: i,
          episodes: seasonResponse.data.episodes.map((episode: any) => ({
            number: episode.episode_number,
            title: episode.name,
            description: episode.overview || 'No description available.',
            thumbnailUrl: episode.still_path 
              ? `https://image.tmdb.org/t/p/w300${episode.still_path}` 
              : '/placeholder.svg',
            duration: '30-60 min',
          }))
        });
      } catch (err) {
        console.error(`Error fetching season ${i} for series ${id}:`, err);
        // Add a placeholder season with minimal info
        seasons.push({
          number: i,
          episodes: [{
            number: 1,
            title: 'Episode information unavailable',
            description: 'Episode details could not be loaded.',
            thumbnailUrl: '/placeholder.svg',
            duration: 'Unknown',
          }]
        });
      }
    }
    
    // Add additional details
    return {
      ...seriesData,
      creators: response.data.created_by?.map((person: any) => person.name) || ['Unknown'],
      cast: response.data.credits?.cast?.slice(0, 10).map((person: any) => person.name) || [],
      seasons: seasons,
      similarSeries: response.data.similar?.results?.slice(0, 6).map(formatSeriesData) || []
    };
  } catch (error) {
    console.error(`Error fetching series details for ID ${id}:`, error);
    // Return a minimal series object instead of throwing
    return {
      id,
      title: 'Series Not Found',
      description: 'Unable to load series details. Please try again later.',
      posterUrl: '/placeholder.svg',
      backdropUrl: '/placeholder.svg',
      year: 'Unknown',
      rating: 'N/A',
      genres: [],
      cast: [],
      creators: ['Unknown'],
      seasons: [],
      similarSeries: [],
      type: 'series'
    };
  }
};

export const getSeriesSeasonDetails = async (id: string, seasonNumber: number) => {
  try {
    const response = await tmdbApi.get(`/tv/${id}/season/${seasonNumber}`);
    return {
      number: seasonNumber,
      episodes: response.data.episodes.map((episode: any) => ({
        number: episode.episode_number,
        title: episode.name,
        description: episode.overview || 'No description available.',
        thumbnailUrl: episode.still_path 
          ? `https://image.tmdb.org/t/p/w300${episode.still_path}` 
          : '/placeholder.svg',
        duration: '30-60 min',
      }))
    };
  } catch (error) {
    console.error(`Error fetching season ${seasonNumber} for series ${id}:`, error);
    // Return a minimal season object instead of throwing
    return {
      number: seasonNumber,
      episodes: [{
        number: 1,
        title: 'Episode information unavailable',
        description: 'Episode details could not be loaded.',
        thumbnailUrl: '/placeholder.svg',
        duration: 'Unknown',
      }]
    };
  }
};

export const searchContent = async (query: string) => {
  try {
    const response = await tmdbApi.get(`/search/multi?query=${encodeURIComponent(query)}`);
    return response.data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => 
        item.media_type === 'movie' ? formatMovieData(item) : formatSeriesData(item)
      );
  } catch (error) {
    console.error('Error searching content:', error);
    // Return empty array instead of throwing
    return [];
  }
};

// Add these functions to your api.ts file

// Replace the getUserProfile function with this:
export const getUserProfile = async () => {
  try {
    // In a real app with a backend, you would make an API call here
    // For now, we'll get the user from localStorage
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      throw new Error("User not found")
    }
    
    return JSON.parse(storedUser)
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const getUserWatchlist = async (): Promise<(MovieData | SeriesData)[]> => {
  try {
    // Get the current user
    const user = localStorage.getItem("user");
    if (!user) {
      return [];
    }
    
    const userId = JSON.parse(user).id;
    
    // Get the user's watchlist from localStorage
    const watchlistData = localStorage.getItem(`watchlist_${userId}`);
    
    // If no watchlist exists yet, return empty array
    if (!watchlistData) {
      // Create an empty watchlist
      localStorage.setItem(`watchlist_${userId}`, JSON.stringify([]));
      return [];
    }
    
    // Parse the watchlist data
    const watchlistIds = JSON.parse(watchlistData);
    
    // If watchlist is empty, return empty array
    if (!watchlistIds || watchlistIds.length === 0) {
      return [];
    }
    
    // Fetch the details for each item in the watchlist
    const watchlistItems: (MovieData | SeriesData)[] = [];
    for (const item of watchlistIds) {
      try {
        if (item.type === 'movie') {
          const movie = await getMovieDetails(item.id);
          // Ensure the type is explicitly set to 'movie'
          if (movie) {
            const typedMovie: MovieData = {
              ...movie,
              type: 'movie' as const
            };
            watchlistItems.push(typedMovie);
          }
        } else if (item.type === 'series') {
          const series = await getSeriesDetails(item.id);
          // Ensure the type is explicitly set to 'series'
          if (series) {
            const typedSeries: SeriesData = {
              ...series,
              type: 'series' as const
            };
            watchlistItems.push(typedSeries);
          }
        }
      } catch (error) {
        console.error(`Error fetching details for ${item.type} ${item.id}:`, error);
      }
    }
    
    return watchlistItems;
  } catch (error) {
    console.error('Error fetching user watchlist:', error);
    return [];
  }
};

export const addToWatchlist = async (contentId: string, contentType: 'movie' | 'series') => {
  try {
    // Get the current user
    const user = localStorage.getItem("user");
    if (!user) {
      console.error("User not logged in");
      return false;
    }
    
    const userId = JSON.parse(user).id;
    
    // Get the current watchlist
    const watchlistData = localStorage.getItem(`watchlist_${userId}`);
    let watchlist = watchlistData ? JSON.parse(watchlistData) : [];
    
    // Check if the item is already in the watchlist
    if (!watchlist.some((item: any) => item.id === contentId)) {
      // Add the item to the watchlist
      watchlist.push({ id: contentId, type: contentType, addedAt: new Date().toISOString() });
      
      // Save the updated watchlist
      localStorage.setItem(`watchlist_${userId}`, JSON.stringify(watchlist));
      console.log(`Added ${contentType} ${contentId} to watchlist`);
      
      // Dispatch storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: `watchlist_${userId}`,
        newValue: JSON.stringify(watchlist),
        url: window.location.href
      }));
    } else {
      console.log(`${contentType} ${contentId} is already in watchlist`);
    }
    
    return true;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return false;
  }
};

export const removeFromWatchlist = async (contentId: string) => {
  try {
    // Get the current user
    const user = localStorage.getItem("user");
    if (!user) {
      console.error("User not logged in");
      return false;
    }
    
    const userId = JSON.parse(user).id;
    
    // Get the current watchlist
    const watchlistData = localStorage.getItem(`watchlist_${userId}`);
    if (!watchlistData) {
      return true; // Nothing to remove
    }
    
    let watchlist = JSON.parse(watchlistData);
    
    // Remove the item from the watchlist
    watchlist = watchlist.filter((item: any) => item.id !== contentId);
    
    // Save the updated watchlist
    localStorage.setItem(`watchlist_${userId}`, JSON.stringify(watchlist));
    console.log(`Removed ${contentId} from watchlist`);
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: `watchlist_${userId}`,
      newValue: JSON.stringify(watchlist),
      url: window.location.href
    }));
    
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return false;
  }
};

export const isInWatchlist = async (contentId: string): Promise<boolean> => {
  try {
    // Get the current user
    const user = localStorage.getItem("user");
    if (!user) {
      return false;
    }
    
    const userId = JSON.parse(user).id;
    
    // Get the current watchlist
    const watchlistData = localStorage.getItem(`watchlist_${userId}`);
    if (!watchlistData) {
      return false;
    }
    
    const watchlist = JSON.parse(watchlistData);
    
    // Check if the item is in the watchlist
    return watchlist.some((item: any) => item.id === contentId);
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
};

export default tmdbApi;