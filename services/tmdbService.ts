import { MovieGenre } from '../types';

const API_KEY = 'fb1864f3b2d8892f733bb34a38b40ef6';
const API_BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
export const POSTER_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Cache for series details to avoid re-fetching within a session
const seriesDetailsCache = new Map<number, any>();


export interface Movie {
  id: number;
  title: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string | null;
}

export interface Series {
  id: number;
  name: string;
  backdrop_path: string | null;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  overview: string | null;
}

export interface SeriesSeason {
  id: number;
  name: string; // e.g., "Season 1"
  season_number: number;
  poster_path: string | null;
  vote_average: number;
  series_name: string; 
}

export interface SeriesSeasonRatingGameRoundData {
  season1: SeriesSeason;
  season2: SeriesSeason;
}

interface QuizRoundData {
    correctMovie: Movie;
    options: string[];
}

export interface SeriesQuizRoundData {
    correctSeries: Series;
    options: string[];
}

export interface DescriptionQuizRoundData {
    correctMovie: Movie;
    options: string[];
}

export interface Director {
    id: number;
    name: string;
}

export interface DirectorQuizRoundData {
    movie: Movie;
    correctDirector: Director;
    options: string[];
}

export interface YearQuizRoundData {
    movie: Movie;
    options: number[];
    correctYear: number;
    directorName: string | null;
}

export interface Actor {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

export interface ActorQuizRoundData {
    actors: Actor[];
    correctMovie: Movie;
    options: string[];
}

export interface SeriesActorQuizRoundData {
    actors: Actor[];
    correctSeries: Series;
    options: string[];
}

export interface SeriesDescriptionQuizRoundData {
    correctSeries: Series;
    options: string[];
}


const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Genre IDs from TMDB
const GENRE_IDS = {
  [MovieGenre.HORROR]: 27,
  [MovieGenre.COMEDY]: 35,
};

// Genre IDs for TV shows from TMDB
const TV_GENRE_IDS = {
  [MovieGenre.HORROR]: 10765, // Sci-Fi & Fantasy - often includes horror
  [MovieGenre.COMEDY]: 35,
};


export const getMovieCredits = async (movieId: number): Promise<{ director: Director | null }> => {
    const url = `${API_BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=ru-RU`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch credits for movie ID ${movieId}. Status:`, response.status);
            return { director: null };
        }
        const data = await response.json();
        const directorData = data.crew.find((member: any) => member.job === 'Director');
        if (directorData) {
            return { director: { id: directorData.id, name: directorData.name } };
        }
    } catch (error) {
        console.error(`Error fetching credits for movie ID ${movieId}:`, error);
    }
    return { director: null };
};

export const getPopularDirectors = async (count: number, excludeIds: number[] = []): Promise<Director[]> => {
    const directors: Director[] = [];
    const seenIds = new Set<number>(excludeIds);
    const startPage = Math.floor(Math.random() * 50) + 1; // Start from a random page for variety
    let page = startPage;

    while (directors.length < count && page < startPage + 20) { // Search up to 20 pages from the start
        const url = `${API_BASE_URL}/person/popular?api_key=${API_KEY}&language=ru-RU&page=${page}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error('Failed to fetch popular people. Status:', response.status);
                break;
            }
            const data = await response.json();
            const popularPeople = data.results || [];

            for (const person of popularPeople) {
                if (directors.length >= count) break;
                // We accept 'Acting' as well because many famous directors are also actors.
                if ((person.known_for_department === 'Directing' || person.known_for_department === 'Acting') && !seenIds.has(person.id)) {
                    directors.push({ id: person.id, name: person.name });
                    seenIds.add(person.id);
                }
            }
        } catch (error) {
            console.error('Error fetching popular people:', error);
            break;
        }
        page++;
    }
    return directors;
};


export const getMovieQuizRound = async (genre: MovieGenre): Promise<QuizRoundData> => {
    const movies: Movie[] = [];
    const seenIds = new Set<number>();
    const genreId = genre !== MovieGenre.ALL ? GENRE_IDS[genre] : null;

    // We need 4 unique movies with backdrops and Russian titles
    while (movies.length < 4) {
        // Get a random page of popular movies. TMDB API documentation suggests not to query beyond page 500.
        const randomPage = Math.floor(Math.random() * (genreId ? 50 : 500)) + 1;
        
        try {
            let url = `${API_BASE_URL}/discover/movie?api_key=${API_KEY}&language=ru-RU&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}&vote_count.gte=100`;
            if (genreId) {
                url += `&with_genres=${genreId}`;
            }

            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Failed to fetch movies from TMDB. Status:', response.status);
                continue; // try another page
            }

            const data = await response.json();
            
            const validMovies = (data.results || []).filter(
                (movie: any) => movie.backdrop_path && movie.title && movie.release_date && !seenIds.has(movie.id)
            );

            for (const movie of validMovies) {
                if (movies.length < 4) {
                    movies.push({
                        id: movie.id,
                        title: movie.title,
                        backdrop_path: movie.backdrop_path,
                        poster_path: movie.poster_path,
                        release_date: movie.release_date,
                        vote_average: movie.vote_average,
                        overview: movie.overview,
                    });
                    seenIds.add(movie.id);
                } else {
                    break;
                }
            }
        } catch (error) {
            console.error('Error fetching data from TMDB:', error);
            // If there's a network error, we might want to throw or handle it
            // For now, we'll let the loop continue trying
        }
    }
    
    if (movies.length < 4) {
        throw new Error('Could not fetch enough unique movies for a quiz round.');
    }

    const correctMovie = movies[0];
    const options = shuffleArray(movies.map(m => `${m.title} (${new Date(m.release_date).getFullYear()})`));

    return { correctMovie, options };
};

export const getSeriesQuizRound = async (genre: MovieGenre): Promise<SeriesQuizRoundData> => {
    const seriesList: Series[] = [];
    const seenIds = new Set<number>();
    const genreId = genre !== MovieGenre.ALL ? TV_GENRE_IDS[genre] : null;

    while (seriesList.length < 4) {
        const randomPage = Math.floor(Math.random() * (genreId ? 50 : 200)) + 1;
        
        try {
            let url = `${API_BASE_URL}/discover/tv?api_key=${API_KEY}&language=ru-RU&sort_by=popularity.desc&include_adult=false&page=${randomPage}&vote_count.gte=100`;
            if (genreId) {
                url += `&with_genres=${genreId}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                console.error('Failed to fetch series from TMDB. Status:', response.status);
                continue;
            }

            const data = await response.json();
            const validSeries = (data.results || []).filter(
                (series: any) => series.backdrop_path && series.name && series.first_air_date && !seenIds.has(series.id)
            );

            for (const series of validSeries) {
                if (seriesList.length < 4) {
                    seriesList.push({
                        id: series.id,
                        name: series.name,
                        backdrop_path: series.backdrop_path,
                        poster_path: series.poster_path,
                        first_air_date: series.first_air_date,
                        vote_average: series.vote_average,
                        overview: series.overview,
                    });
                    seenIds.add(series.id);
                } else {
                    break;
                }
            }
        } catch (error) {
            console.error('Error fetching series data from TMDB:', error);
        }
    }
    
    if (seriesList.length < 4) {
        throw new Error('Could not fetch enough unique series for a quiz round.');
    }

    const correctSeries = seriesList[0];
    const options = shuffleArray(seriesList.map(s => `${s.name} (${new Date(s.first_air_date).getFullYear()})`));

    return { correctSeries, options };
};

interface GetMovieForRatingGameOptions {
    excludeId?: number;
    excludeVoteAverage?: number;
    fetchCloseRating?: boolean;
    targetRating?: number;
    ratingDifference?: number;
}

export const getMovieForRatingGame = async (options: GetMovieForRatingGameOptions = {}, genre: MovieGenre): Promise<Movie> => {
    const { excludeId, excludeVoteAverage, fetchCloseRating, targetRating, ratingDifference = 0.5 } = options;
    const genreId = genre !== MovieGenre.ALL ? GENRE_IDS[genre] : null;
    
    while (true) {
        const randomPage = Math.floor(Math.random() * (genreId ? 50 : 200)) + 1; // Limit to first 200 pages for quality
        
        let url = `${API_BASE_URL}/discover/movie?api_key=${API_KEY}&language=ru-RU&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}&vote_count.gte=200`;
        
        if (genreId) {
            url += `&with_genres=${genreId}`;
        }


        if (fetchCloseRating && targetRating !== undefined) {
            const minRating = Math.max(0, targetRating - ratingDifference);
            const maxRating = Math.min(10, targetRating + ratingDifference);
            url += `&vote_average.gte=${minRating.toFixed(1)}&vote_average.lte=${maxRating.toFixed(1)}`;
        }

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Failed to fetch movie from TMDB. Status:', response.status);
                await new Promise(resolve => setTimeout(resolve, 1000)); // wait a bit before retrying
                continue;
            }

            const data = await response.json();
            
            const validMovies = (data.results || []).filter(
                (movie: any) => {
                     const isExcluded = movie.id === excludeId || 
                                       (!fetchCloseRating && movie.vote_average === excludeVoteAverage);
                     return movie.poster_path && movie.title && movie.release_date && movie.vote_average > 0 && !isExcluded;
                }
            );

            if (validMovies.length > 0) {
                const randomMovie = validMovies[Math.floor(Math.random() * validMovies.length)];
                return {
                    id: randomMovie.id,
                    title: randomMovie.title,
                    backdrop_path: randomMovie.backdrop_path,
                    poster_path: randomMovie.poster_path,
                    release_date: randomMovie.release_date,
                    vote_average: randomMovie.vote_average,
                    overview: randomMovie.overview,
                };
            }
        } catch (error) {
            console.error('Error fetching data from TMDB:', error);
            await new Promise(resolve => setTimeout(resolve, 1000)); // wait on network error
        }
    }
};

const generateUniqueRandoms = (range: number, count: number, exclude: number[]): number[] => {
    const nums = new Set<number>();
    const allExcluded = new Set<number>(exclude);
    const currentYear = new Date().getFullYear();
    while (nums.size < count) {
        const randomOffset = Math.floor(Math.random() * (range * 2 + 1)) - range;
        const potentialYear = exclude[0] + randomOffset;
        if (randomOffset !== 0 && !allExcluded.has(potentialYear) && potentialYear <= currentYear) {
            nums.add(potentialYear);
            allExcluded.add(potentialYear);
        }
    }
    return Array.from(nums);
};

export const getYearQuizRound = async (genre: MovieGenre): Promise<YearQuizRoundData> => {
    while (true) {
        const movie = await getMovieForRatingGame({}, genre);
        const correctYear = new Date(movie.release_date).getFullYear();

        if (correctYear) {
            const { director } = await getMovieCredits(movie.id);
            const otherYears = generateUniqueRandoms(10, 3, [correctYear]);
            
            if (otherYears.length < 3) {
                console.warn(`Could not generate enough unique years. Retrying...`);
                continue;
            }
            
            const options = shuffleArray([correctYear, ...otherYears]);

            return {
                movie,
                options,
                correctYear,
                directorName: director ? director.name : null,
            };
        }
    }
};

export const getDirectorQuizRound = async (genre: MovieGenre): Promise<DirectorQuizRoundData> => {
    while (true) {
        // Re-use helper to get a high-quality movie with a poster
        const movie = await getMovieForRatingGame({}, genre);
        const { director } = await getMovieCredits(movie.id);

        if (director) {
            const otherDirectors = await getPopularDirectors(3, [director.id]);
            if (otherDirectors.length < 3) {
                // Not enough distractors, try with another movie
                console.warn(`Could not find 3 other directors. Retrying...`);
                continue;
            }

            const options = shuffleArray([director.name, ...otherDirectors.map(d => d.name)]);
            return {
                movie,
                correctDirector: director,
                options,
            };
        }
        // If no director found for this movie, the loop continues and fetches another one.
    }
};

export const getMovieCast = async (movieId: number, count: number): Promise<Actor[]> => {
    const url = `${API_BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=ru-RU`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch cast for movie ID ${movieId}. Status:`, response.status);
            return [];
        }
        const data = await response.json();
        const castData = (data.cast || [])
            .filter((member: any) => member.known_for_department === 'Acting' && member.profile_path)
            .slice(0, count);
        
        return castData.map((member: any) => ({
            id: member.id,
            name: member.name,
            character: member.character,
            profile_path: member.profile_path,
        }));
    } catch (error) {
        console.error(`Error fetching cast for movie ID ${movieId}:`, error);
    }
    return [];
};

export const getActorQuizRound = async (genre: MovieGenre): Promise<ActorQuizRoundData> => {
    while (true) {
        const correctMovie = await getMovieForRatingGame({}, genre);
        const actors = await getMovieCast(correctMovie.id, 5);

        if (actors.length >= 4) {
            const distractorMovies: Movie[] = [];
            const seenIds = new Set<number>([correctMovie.id]);

            while (distractorMovies.length < 3) {
                try {
                    const distractor = await getMovieForRatingGame({ excludeId: Array.from(seenIds).pop() }, genre);
                    if (!seenIds.has(distractor.id)) {
                        distractorMovies.push(distractor);
                        seenIds.add(distractor.id);
                    }
                } catch (error) {
                    console.error("Failed to fetch a distractor movie, retrying...", error);
                }
            }

            const correctOption = `${correctMovie.title} (${new Date(correctMovie.release_date).getFullYear()})`;
            const incorrectOptions = distractorMovies.map(m => `${m.title} (${new Date(m.release_date).getFullYear()})`);
            
            const options = shuffleArray([correctOption, ...incorrectOptions]);

            return {
                actors,
                correctMovie,
                options
            };
        }
        console.warn("Movie didn't have enough actors, fetching another one...");
    }
};

export const getDescriptionQuizRound = async (genre: MovieGenre): Promise<DescriptionQuizRoundData> => {
    const movies: Movie[] = [];
    const seenIds = new Set<number>();
    const genreId = genre !== MovieGenre.ALL ? GENRE_IDS[genre] : null;

    while (movies.length < 4) {
        const randomPage = Math.floor(Math.random() * (genreId ? 50 : 250)) + 1;
        
        try {
            let url = `${API_BASE_URL}/discover/movie?api_key=${API_KEY}&language=ru-RU&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}&vote_count.gte=150`;
            if (genreId) {
                url += `&with_genres=${genreId}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                console.error('Failed to fetch movies from TMDB for description quiz. Status:', response.status);
                continue;
            }

            const data = await response.json();
            
            const validMovies = (data.results || []).filter(
                (movie: any) => movie.overview && movie.overview.length > 50 && movie.title && movie.release_date && !seenIds.has(movie.id)
            );

            for (const movie of validMovies) {
                if (movies.length < 4) {
                    movies.push({
                        id: movie.id,
                        title: movie.title,
                        backdrop_path: movie.backdrop_path,
                        poster_path: movie.poster_path,
                        release_date: movie.release_date,
                        vote_average: movie.vote_average,
                        overview: movie.overview,
                    });
                    seenIds.add(movie.id);
                } else {
                    break;
                }
            }
        } catch (error) {
            console.error('Error fetching data from TMDB for description quiz:', error);
        }
    }
    
    if (movies.length < 4) {
        throw new Error('Could not fetch enough unique movies for a description quiz round.');
    }

    const correctMovie = movies[0];
    const options = shuffleArray(movies.map(m => `${m.title} (${new Date(m.release_date).getFullYear()})`));

    return { correctMovie, options };
};

export const getSeriesCast = async (seriesId: number, count: number): Promise<Actor[]> => {
    const url = `${API_BASE_URL}/tv/${seriesId}/credits?api_key=${API_KEY}&language=ru-RU`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch cast for series ID ${seriesId}. Status:`, response.status);
            return [];
        }
        const data = await response.json();
        const castData = (data.cast || [])
            .filter((member: any) => member.known_for_department === 'Acting' && member.profile_path)
            .slice(0, count);
        
        return castData.map((member: any) => ({
            id: member.id,
            name: member.name,
            character: member.character,
            profile_path: member.profile_path,
        }));
    } catch (error) {
        console.error(`Error fetching cast for series ID ${seriesId}:`, error);
    }
    return [];
};

export const getSeriesActorQuizRound = async (genre: MovieGenre): Promise<SeriesActorQuizRoundData> => {
    while (true) {
        // Find a series first
        const randomPage = Math.floor(Math.random() * (genre !== MovieGenre.ALL ? 50 : 200)) + 1;
        const genreId = genre !== MovieGenre.ALL ? TV_GENRE_IDS[genre] : null;
        let url = `${API_BASE_URL}/discover/tv?api_key=${API_KEY}&language=ru-RU&sort_by=popularity.desc&page=${randomPage}&vote_count.gte=100`;
        if (genreId) {
            url += `&with_genres=${genreId}`;
        }
        const seriesResponse = await fetch(url);
        if (!seriesResponse.ok) {
            console.error('Failed to fetch series list for actor quiz.');
            continue;
        }
        const seriesData = await seriesResponse.json();
        const seriesCandidates: Series[] = (seriesData.results || []).filter((s: any) => s.poster_path);

        if (seriesCandidates.length === 0) continue;
        
        const correctSeries = seriesCandidates[Math.floor(Math.random() * seriesCandidates.length)];

        const actors = await getSeriesCast(correctSeries.id, 5);

        if (actors.length >= 4) {
            const distractorSeries: Series[] = [];
            const seenIds = new Set<number>([correctSeries.id]);

            while (distractorSeries.length < 3) {
                 try {
                    const distractorPage = Math.floor(Math.random() * (genre !== MovieGenre.ALL ? 50 : 200)) + 1;
                    let distractorUrl = `${API_BASE_URL}/discover/tv?api_key=${API_KEY}&language=ru-RU&sort_by=popularity.desc&page=${distractorPage}&vote_count.gte=100`;
                    if (genreId) {
                        distractorUrl += `&with_genres=${genreId}`;
                    }
                    const distractorResponse = await fetch(distractorUrl);
                    if (!distractorResponse.ok) continue;
                    const distractorData = await distractorResponse.json();
                    const candidates: Series[] = (distractorData.results || []).filter((s: any) => s.poster_path && !seenIds.has(s.id));
                    
                    if (candidates.length > 0) {
                        const distractor = candidates[0];
                        distractorSeries.push(distractor);
                        seenIds.add(distractor.id);
                    }
                } catch (error) {
                    console.error("Failed to fetch a distractor series, retrying...", error);
                }
            }

            const correctOption = `${correctSeries.name} (${new Date(correctSeries.first_air_date).getFullYear()})`;
            const incorrectOptions = distractorSeries.map(s => `${s.name} (${new Date(s.first_air_date).getFullYear()})`);
            
            const options = shuffleArray([correctOption, ...incorrectOptions]);

            return {
                actors,
                correctSeries,
                options
            };
        }
        console.warn("Series didn't have enough actors, fetching another one...");
    }
};

export const getSeriesDescriptionQuizRound = async (genre: MovieGenre): Promise<SeriesDescriptionQuizRoundData> => {
    const seriesList: Series[] = [];
    const seenIds = new Set<number>();
    const genreId = genre !== MovieGenre.ALL ? TV_GENRE_IDS[genre] : null;

    while (seriesList.length < 4) {
        const randomPage = Math.floor(Math.random() * (genreId ? 50 : 200)) + 1;
        
        try {
            let url = `${API_BASE_URL}/discover/tv?api_key=${API_KEY}&language=ru-RU&sort_by=popularity.desc&page=${randomPage}&vote_count.gte=100`;
            if (genreId) {
                url += `&with_genres=${genreId}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                console.error('Failed to fetch series from TMDB for description quiz. Status:', response.status);
                continue;
            }

            const data = await response.json();
            
            const validSeries = (data.results || []).filter(
                (series: any) => series.overview && series.overview.length > 50 && series.name && series.first_air_date && !seenIds.has(series.id)
            );

            for (const series of validSeries) {
                if (seriesList.length < 4) {
                    seriesList.push({
                        id: series.id,
                        name: series.name,
                        backdrop_path: series.backdrop_path,
                        poster_path: series.poster_path,
                        first_air_date: series.first_air_date,
                        vote_average: series.vote_average,
                        overview: series.overview,
                    });
                    seenIds.add(series.id);
                } else {
                    break;
                }
            }
        } catch (error) {
            console.error('Error fetching series data from TMDB for description quiz:', error);
        }
    }
    
    if (seriesList.length < 4) {
        throw new Error('Could not fetch enough unique series for a description quiz round.');
    }

    const correctSeries = seriesList[0];
    const options = shuffleArray(seriesList.map(s => `${s.name} (${new Date(s.first_air_date).getFullYear()})`));

    return { correctSeries, options };
};

const getSeriesSeasonDetails = async (seriesId: number, seasonNumber: number): Promise<any> => {
    const url = `${API_BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}&language=ru-RU`;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Error fetching season ${seasonNumber} for series ${seriesId}:`, error);
        return null;
    }
}

export const getSeriesSeasonRatingGameRound = async (genre: MovieGenre): Promise<SeriesSeasonRatingGameRoundData> => {
    let attempts = 0;
    const MAX_ATTEMPTS = 20;

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        try {
            const randomPage = Math.floor(Math.random() * 50) + 1;
            const genreId = genre !== MovieGenre.ALL ? TV_GENRE_IDS[genre] : null;
            let discoverUrl = `${API_BASE_URL}/discover/tv?api_key=${API_KEY}&language=ru-RU&sort_by=popularity.desc&page=${randomPage}&vote_count.gte=150`;
            if (genreId) {
                discoverUrl += `&with_genres=${genreId}`;
            }

            const discoverResponse = await fetch(discoverUrl);
            if (!discoverResponse.ok) {
                console.error('Failed to fetch series list, retrying...');
                await new Promise(res => setTimeout(res, 500));
                continue;
            }

            const discoverData = await discoverResponse.json();
            const seriesCandidates: any[] = discoverData.results || [];
            
            shuffleArray(seriesCandidates);

            for (const seriesInfo of seriesCandidates) {
                const detailsUrl = `${API_BASE_URL}/tv/${seriesInfo.id}?api_key=${API_KEY}&language=ru-RU`;
                const detailsResponse = await fetch(detailsUrl);
                if (!detailsResponse.ok) continue;

                const seriesDetails = await detailsResponse.json();
                
                if (seriesDetails.number_of_seasons < 2) continue;

                // This game needs individual season details to ensure vote_average is present.
                const seasonPromises = (seriesDetails.seasons || [])
                    .filter((s: any) => s.season_number > 0)
                    .map((s: any) => getSeriesSeasonDetails(seriesDetails.id, s.season_number));
                
                const seasonsData = await Promise.all(seasonPromises);

                const validSeasons: SeriesSeason[] = seasonsData
                    .filter(s => s && s.poster_path && s.vote_average > 0)
                    .map(s => ({
                        id: s.id,
                        name: s.name,
                        season_number: s.season_number,
                        poster_path: s.poster_path,
                        vote_average: s.vote_average,
                        series_name: seriesDetails.name,
                    }));
                
                if (validSeasons.length < 2) continue;

                const shuffledValidSeasons = shuffleArray(validSeasons);
                for (let i = 0; i < shuffledValidSeasons.length - 1; i++) {
                    for (let j = i + 1; j < shuffledValidSeasons.length; j++) {
                        const season1 = shuffledValidSeasons[i];
                        const season2 = shuffledValidSeasons[j];
                        if (season1.vote_average !== season2.vote_average) {
                            return { season1, season2 };
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Network or parsing error in getSeriesSeasonRatingGameRound:", error);
            await new Promise(res => setTimeout(res, 1000));
        }
    }
    throw new Error("Could not find a suitable series for the game after multiple attempts.");
};

export const getSeriesForSortingGame = async (genre: MovieGenre): Promise<SeriesSeason[]> => {
    let attempts = 0;
    const MAX_ATTEMPTS = 30;

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        try {
            const randomPage = Math.floor(Math.random() * 50) + 1;
            const genreId = genre !== MovieGenre.ALL ? TV_GENRE_IDS[genre] : null;
            let discoverUrl = `${API_BASE_URL}/discover/tv?api_key=${API_KEY}&language=ru-RU&sort_by=popularity.desc&page=${randomPage}&vote_count.gte=200`;
            if (genreId) {
                discoverUrl += `&with_genres=${genreId}`;
            }

            const discoverResponse = await fetch(discoverUrl);
            if (!discoverResponse.ok) {
                console.error('Failed to fetch series list for sorting game, retrying...');
                await new Promise(res => setTimeout(res, 500));
                continue;
            }

            const discoverData = await discoverResponse.json();
            const seriesCandidates: any[] = shuffleArray(discoverData.results || []);

            for (const seriesInfo of seriesCandidates) {
                let seriesDetails;

                if (seriesDetailsCache.has(seriesInfo.id)) {
                    seriesDetails = seriesDetailsCache.get(seriesInfo.id);
                } else {
                    const detailsUrl = `${API_BASE_URL}/tv/${seriesInfo.id}?api_key=${API_KEY}&language=ru-RU`;
                    const detailsResponse = await fetch(detailsUrl);
                    if (!detailsResponse.ok) continue;
                    seriesDetails = await detailsResponse.json();
                    seriesDetailsCache.set(seriesInfo.id, seriesDetails);
                }
                
                // We need at least 3 seasons with valid data to make the game interesting.
                if (!seriesDetails.seasons || seriesDetails.seasons.length < 3) continue;

                const validSeasons: SeriesSeason[] = seriesDetails.seasons
                    .filter((s: any) => 
                        s.season_number > 0 && // Exclude "Specials" which are often season 0
                        s.poster_path && 
                        s.vote_average > 0
                    )
                    .map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        season_number: s.season_number,
                        poster_path: s.poster_path,
                        vote_average: s.vote_average,
                        series_name: seriesDetails.name,
                    }));
                
                if (validSeasons.length >= 3) {
                    return validSeasons;
                }
            }
        } catch (error) {
            console.error("Network or parsing error in getSeriesForSortingGame:", error);
            await new Promise(res => setTimeout(res, 1000));
        }
    }
    throw new Error("Could not find a suitable series for sorting game after multiple attempts.");
};