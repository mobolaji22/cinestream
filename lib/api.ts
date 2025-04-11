import axios from 'axios';

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
const formatMovieData = (movie: any) => ({
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
const formatSeriesData = (series: any) => ({
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

export default tmdbApi;