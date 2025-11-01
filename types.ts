export enum QuizCategory {
  GAMES = 'GAMES',
  MOVIES = 'MOVIES',
  SERIES = 'SERIES',
  BOOKS = 'BOOKS',
  MUSIC = 'MUSIC',
  OTHER = 'OTHER',
}

export enum MovieGenre {
  ALL = 'ALL',
  HORROR = 'HORROR',
  COMEDY = 'COMEDY',
}

export enum FeedbackDisplayCondition {
  ALWAYS = 'ALWAYS',
  ON_CORRECT = 'ON_CORRECT',
  ON_INCORRECT = 'ON_INCORRECT',
}

export interface QuestionFeedback {
  text: string;
  displayCondition: FeedbackDisplayCondition;
}

export interface Question {
  id: string;
  questionText: string;
  image?: string; // base64 string
  options: string[];
  correctAnswerIndex: number[];
  timeLimit?: number; // in seconds
  feedback?: QuestionFeedback;
}

export interface QuestionStats {
  attempts: number;
  correct: number;
  answers: { [optionIndex: number]: number }; // count for each option index
}

export interface QuizStats {
  totalPlays: number;
  totalCorrectAnswers: number;
  questionStats: { [questionId: string]: QuestionStats };
}

export interface Quiz {
  id: string;
  creatorId: string;
  title: string;
  category: QuizCategory;
  questions: Question[];
  ratings: number[];
  averageRating: number;
  stats: QuizStats;
  playedBy: string[]; // Array of user IDs who have played this quiz
  timeLimit?: number; // in seconds
  playUntilFirstMistake?: boolean;
  isPrivate?: boolean;
}

export type UserAnswers = { [questionId: string]: number | number[] };

export interface UserPlayRecord {
  quizId: string;
  quizTitle: string;
  category: QuizCategory;
  score: number;
  totalQuestions: number;
  date: string; // ISO string
}

export interface GameStats {
  movieQuiz: {
    [key in MovieGenre]?: number;
  };
  seriesQuiz: {
    [key in MovieGenre]?: number;
  };
  movieRatingGame: {
    [key in MovieGenre]?: number;
  };
  seriesSeasonRatingGame: {
    [key in MovieGenre]?: number;
  };
  directorQuiz: {
    [key in MovieGenre]?: number;
  };
  yearQuiz: {
    [key in MovieGenre]?: number;
  };
  actorQuiz: {
    [key in MovieGenre]?: number;
  };
  seriesActorQuiz: {
    [key in MovieGenre]?: number;
  };
  descriptionQuiz: {
    [key in MovieGenre]?: {
      rounds: number;
      avgPercentage: number;
    };
  };
  seriesDescriptionQuiz: {
    [key in MovieGenre]?: {
      rounds: number;
      avgPercentage: number;
    };
  };
}

export interface LeaderboardEntry {
  userId: string;
  score: number;
}

export interface Leaderboards {
  movieQuiz: {
    [key in MovieGenre]?: LeaderboardEntry[];
  };
  seriesQuiz: {
    [key in MovieGenre]?: LeaderboardEntry[];
  };
  movieRatingGame: {
    [key in MovieGenre]?: LeaderboardEntry[];
  };
  seriesSeasonRatingGame: {
    [key in MovieGenre]?: LeaderboardEntry[];
  };
  directorQuiz: {
    [key in MovieGenre]?: LeaderboardEntry[];
  };
  yearQuiz: {
    [key in MovieGenre]?: LeaderboardEntry[];
  };
  actorQuiz: {
    [key in MovieGenre]?: LeaderboardEntry[];
  };
  seriesActorQuiz: {
    [key in MovieGenre]?: LeaderboardEntry[];
  };
  descriptionQuiz: {
    [key in MovieGenre]?: LeaderboardEntry[];
  };
}

export enum AppView {
  LIST = 'LIST',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  PLAY = 'PLAY',
  RESULT = 'RESULT',
  LOGIN = 'LOGIN',
  MOVIE_QUIZ = 'MOVIE_QUIZ',
  SERIES_QUIZ = 'SERIES_QUIZ',
  MOVIE_RATING_GAME = 'MOVIE_RATING_GAME',
  SERIES_SEASON_RATING_GAME = 'SERIES_SEASON_RATING_GAME',
  DIRECTOR_QUIZ = 'DIRECTOR_QUIZ',
  YEAR_QUIZ = 'YEAR_QUIZ',
  ACTOR_QUIZ = 'ACTOR_QUIZ',
  DESCRIPTION_QUIZ = 'DESCRIPTION_QUIZ',
  STATS = 'STATS',
  USER_PROFILE = 'USER_PROFILE',
  SERIES_SORTING_GAME = 'SERIES_SORTING_GAME',
  SERIES_ACTOR_QUIZ = 'SERIES_ACTOR_QUIZ',
  SERIES_DESCRIPTION_QUIZ = 'SERIES_DESCRIPTION_QUIZ',
}