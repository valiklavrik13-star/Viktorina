import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Quiz, AppView, UserAnswers, QuestionStats, Question, UserPlayRecord, MovieGenre, GameStats, Leaderboards, LeaderboardEntry } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { QuizList } from './components/QuizList';
import { CreateQuiz } from './components/CreateQuiz';
import { QuizPlayer } from './components/QuizPlayer';
import { QuizResult } from './components/QuizResult';
import { MovieQuizPlayer } from './components/MovieQuizPlayer';
import { MovieRatingGamePlayer } from './components/MovieRatingGamePlayer';
import { DirectorQuizPlayer } from './components/DirectorQuizPlayer';
import { YearQuizPlayer } from './components/YearQuizPlayer';
import { QuizStats as QuizStatsComponent } from './components/QuizStats';
import { UserProfile } from './components/UserProfile';
import { Header } from './components/Header';
import { ActorQuizPlayer } from './components/ActorQuizPlayer';
import { useTranslation } from './hooks/useTranslation';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { DescriptionQuizPlayer } from './components/DescriptionQuizPlayer';
import { ReportDialog } from './components/ReportDialog';
import { Notification } from './components/Notification';
import { SeriesQuizPlayer } from './components/SeriesQuizPlayer';
import { SeriesSeasonRatingGamePlayer } from './components/SeriesSeasonRatingGamePlayer';
import { SeriesSortingGamePlayer } from './components/SeriesSortingGamePlayer';
import { SeriesActorQuizPlayer } from './components/SeriesActorQuizPlayer';
import { SeriesDescriptionQuizPlayer } from './components/SeriesDescriptionQuizPlayer';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';

type GameOverResult = number | { rounds: number; avgPercentage: number };

const App = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [playHistory, setPlayHistory] = useLocalStorage<UserPlayRecord[]>('playHistory', []);
  const [gameStats, setGameStats] = useLocalStorage<GameStats>('gameStats', { movieQuiz: {}, seriesQuiz: {}, movieRatingGame: {}, seriesSeasonRatingGame: {}, directorQuiz: {}, yearQuiz: {}, actorQuiz: {}, seriesActorQuiz: {}, descriptionQuiz: {}, seriesDescriptionQuiz: {} });
  const [leaderboards, setLeaderboards] = useLocalStorage<Leaderboards>('leaderboards', { movieQuiz: {}, seriesQuiz: {}, movieRatingGame: {}, seriesSeasonRatingGame: {}, directorQuiz: {}, yearQuiz: {}, actorQuiz: {}, seriesActorQuiz: {}, descriptionQuiz: {} });
  
  const { user, isAuthenticated, logout } = useAuth();

  const [currentView, setCurrentView] = useState<AppView>(AppView.LIST);
  const [postLoginRedirect, setPostLoginRedirect] = useState<AppView>(AppView.LIST);

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [statsQuiz, setStatsQuiz] = useState<Quiz | null>(null);
  const [activeMovieGameOptions, setActiveMovieGameOptions] = useState<{ genre: MovieGenre } | null>(null);
  const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void; isDestructive: boolean; confirmText: string; } | null>(null);
  const [reportingQuiz, setReportingQuiz] = useState<Quiz | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationKey, setNotificationKey] = useState(0);
  const [privateQuizIdToPlay, setPrivateQuizIdToPlay] = useState<string | null>(null);


  const [lastAnswers, setLastAnswers] = useState<UserAnswers>({});
  const { t } = useTranslation();

  useEffect(() => {
    const fetchQuizzes = async () => {
        try {
            const response = await fetch('/api/quizzes');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setQuizzes(data);
        } catch (error) {
            console.error("Failed to fetch quizzes:", error);
            handleShowNotification("Не удалось загрузить викторины с сервера.");
        }
    };
    fetchQuizzes();
  }, []);

  const handleStartQuiz = useCallback((quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentView(AppView.PLAY);
  }, []);
  
  const requireAuth = useCallback((targetView: AppView) => {
    if (!isAuthenticated) {
        setPostLoginRedirect(targetView);
        setCurrentView(AppView.LOGIN);
        return false;
    }
    setCurrentView(targetView);
    return true;
  }, [isAuthenticated]);


  useEffect(() => {
    if (isAuthenticated && currentView === AppView.LOGIN) {
        if (privateQuizIdToPlay) {
            const quizToStart = quizzes.find(q => q.id === privateQuizIdToPlay);
            if (quizToStart) {
                handleStartQuiz(quizToStart);
                setPrivateQuizIdToPlay(null);
            } else {
                setCurrentView(postLoginRedirect);
            }
        } else {
            setCurrentView(postLoginRedirect);
        }
    }
  }, [isAuthenticated, currentView, postLoginRedirect, privateQuizIdToPlay, quizzes, handleStartQuiz]);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quiz');
    if (quizId && quizzes.length > 0) { // Ensure quizzes are loaded
        const quizToStart = quizzes.find(q => q.id === quizId);
        if (quizToStart) {
            if (quizToStart.isPrivate) {
                if (isAuthenticated) {
                    handleStartQuiz(quizToStart);
                } else {
                    setPrivateQuizIdToPlay(quizId);
                    requireAuth(AppView.PLAY);
                }
            } else {
                handleStartQuiz(quizToStart);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizzes, isAuthenticated]);

  const myQuizzesCount = useMemo(() => {
    if (!isAuthenticated || !user) return 0;
    return quizzes.filter(q => q.creatorId === user.id).length;
  }, [quizzes, user, isAuthenticated]);

  const isMyQuiz = useCallback((quiz: Quiz) => isAuthenticated && user ? quiz.creatorId === user.id : false, [user, isAuthenticated]);

  const handleBackToList = () => {
    setActiveQuiz(null);
    setStatsQuiz(null);
    setEditingQuiz(null);
    setLastAnswers({});
    setCurrentView(AppView.LIST);
  }

  const handleCreateQuiz = () => requireAuth(AppView.CREATE);
  
  const handleViewStats = (quiz: Quiz) => {
    setStatsQuiz(quiz);
    setCurrentView(AppView.STATS);
  };

  const handleViewProfile = () => requireAuth(AppView.USER_PROFILE);
  
  const handleSaveQuiz = async (quizData: Omit<Quiz, 'id' | 'ratings' | 'averageRating' | 'creatorId' | 'stats' | 'playedBy'>) => {
    if (!isAuthenticated || !user) return;

    try {
        const response = await fetch('/api/quizzes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...quizData, creatorId: user.id }),
        });
        if (!response.ok) throw new Error('Failed to save quiz');
        const savedQuiz = await response.json();
        setQuizzes(prev => [...prev, savedQuiz]);
        handleBackToList();
    } catch (error) {
        console.error("Error saving quiz:", error);
        handleShowNotification("Ошибка при сохранении викторины.");
    }
  };

  const handleStartEditQuiz = (quizToEdit: Quiz) => {
    setConfirmation({
        message: t('editQuiz.confirmMessage'),
        onConfirm: () => {
            setEditingQuiz(quizToEdit);
            setCurrentView(AppView.EDIT);
            setConfirmation(null);
        },
        isDestructive: true,
        confirmText: t('confirmation.proceed')
    });
  };

  const handleUpdateQuiz = async (updatedData: Omit<Quiz, 'id' | 'ratings' | 'averageRating' | 'creatorId' | 'stats' | 'playedBy'>) => {
    if (!editingQuiz) return;

    try {
        const response = await fetch(`/api/quizzes/${editingQuiz.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error('Failed to update quiz');
        const updatedQuizFromServer = await response.json();
        setQuizzes(prev => prev.map(q => q.id === editingQuiz.id ? updatedQuizFromServer : q));
        setEditingQuiz(null);
        setCurrentView(AppView.LIST);
    } catch (error) {
        console.error("Error updating quiz:", error);
        handleShowNotification("Ошибка при обновлении викторины.");
    }
  };
  
  const handleDeleteQuiz = (quizId: string) => {
    setConfirmation({
        message: t('quizCard.deleteConfirm'),
        onConfirm: async () => {
            try {
                const response = await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete quiz');
                setQuizzes(prev => prev.filter(q => q.id !== quizId));
                setConfirmation(null);
                handleShowNotification("Викторина удалена.");
            } catch (error) {
                console.error("Error deleting quiz:", error);
                handleShowNotification("Ошибка при удалении викторины.");
            }
        },
        isDestructive: true,
        confirmText: t('quizCard.delete')
    });
  };

  const handleStartMovieQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.MOVIE_QUIZ);
  };

  const handleStartSeriesQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.SERIES_QUIZ);
  };

  const handleStartMovieRatingGame = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.MOVIE_RATING_GAME);
  };

  const handleStartSeriesSeasonRatingGame = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.SERIES_SEASON_RATING_GAME);
  };

  const handleStartDirectorQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.DIRECTOR_QUIZ);
  };

  const handleStartYearQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.YEAR_QUIZ);
  };

  const handleStartActorQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.ACTOR_QUIZ);
  };

  const handleStartDescriptionQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.DESCRIPTION_QUIZ);
  };

  const handleStartSeriesSortingGame = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.SERIES_SORTING_GAME);
  };

  const handleStartSeriesActorQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.SERIES_ACTOR_QUIZ);
  };

  const handleStartSeriesDescriptionQuiz = (genre: MovieGenre) => {
    setActiveMovieGameOptions({ genre });
    setCurrentView(AppView.SERIES_DESCRIPTION_QUIZ);
  };

  const handleFinishQuiz = async (answers: UserAnswers, finishedQuiz: Quiz) => {
    setLastAnswers(answers);

    if (isAuthenticated && user) {
        try {
            const response = await fetch(`/api/quizzes/${finishedQuiz.id}/play`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, userId: user.id }),
            });
            if (!response.ok) throw new Error('Failed to record play data');
            const updatedQuiz = await response.json();
            
            // Only update if the server returns a full quiz object
            if (updatedQuiz && updatedQuiz.id) {
                setQuizzes(prev => prev.map(q => q.id === finishedQuiz.id ? updatedQuiz : q));
            }

            const score = Object.entries(answers).reduce((acc, [questionId, userAnswer]) => {
                const question = finishedQuiz.questions.find((q) => q.id === questionId);
                if (question) {
                    const correctAnswer = question.correctAnswerIndex;
                    if (Array.isArray(userAnswer)) {
                        if (userAnswer.length === correctAnswer.length && [...userAnswer].sort().toString() === [...correctAnswer].sort().toString()) {
                            return acc + 1;
                        }
                    } else if (typeof userAnswer === 'number') {
                        if (correctAnswer.length === 1 && userAnswer === correctAnswer[0]) {
                            return acc + 1;
                        }
                    }
                }
                return acc;
            }, 0);

            const newPlayRecord: UserPlayRecord = {
                quizId: finishedQuiz.id,
                quizTitle: finishedQuiz.title,
                category: finishedQuiz.category,
                score: score,
                totalQuestions: finishedQuiz.questions.length,
                date: new Date().toISOString(),
            };
            setPlayHistory(prev => [newPlayRecord, ...prev]);

        } catch (error) {
            console.error("Error finishing quiz:", error);
            handleShowNotification("Не удалось сохранить результаты.");
        }
    }
    setCurrentView(AppView.RESULT);
  };

  const handleGameOver = (game: keyof Omit<GameStats, 'descriptionQuiz' | 'seriesDescriptionQuiz'> | 'descriptionQuiz' | 'seriesDescriptionQuiz', genre: MovieGenre, result: GameOverResult) => {
    if (!isAuthenticated || !user) return;
    
    setGameStats(prev => {
        const newStats = { ...prev };

        if ((game === 'descriptionQuiz' || game === 'seriesDescriptionQuiz') && typeof result === 'object' && result !== null && 'rounds' in result) {
            const currentRecord = newStats[game]?.[genre] || { rounds: 0, avgPercentage: 0 };
            if (result.rounds > currentRecord.rounds) {
                const updatedGameStats = {
                    ...(newStats[game] || {}),
                    [genre]: { rounds: result.rounds, avgPercentage: result.avgPercentage }
                };
                newStats[game] = updatedGameStats as any;
                return newStats;
            }
        } else if (typeof result === 'number') {
            const score = result;
            const currentGameStats = newStats[game as keyof Omit<GameStats, 'descriptionQuiz' | 'seriesDescriptionQuiz'>] as { [key in MovieGenre]?: number } | undefined || {};
            const currentHighScore = currentGameStats[genre] || 0;

            if (score > currentHighScore) {
                const updatedGameStats = { ...currentGameStats, [genre]: score };
                (newStats[game as keyof Omit<GameStats, 'descriptionQuiz' | 'seriesDescriptionQuiz'>] as any) = updatedGameStats;
                return newStats;
            }
        }
        
        return prev;
    });

    if (typeof result === 'number' && result > 0) {
        const score = result;
        setLeaderboards(prev => {
            const newLeaderboards = JSON.parse(JSON.stringify(prev));
            const gameBoard = newLeaderboards[game as keyof Omit<Leaderboards, 'descriptionQuiz'>] || {};
            const genreBoard: LeaderboardEntry[] = gameBoard[genre] || [];

            const userIndex = genreBoard.findIndex(entry => entry.userId === user.id);

            if (userIndex > -1) {
                if (score > genreBoard[userIndex].score) {
                    genreBoard[userIndex].score = score;
                }
            } else {
                genreBoard.push({ userId: user.id, score });
            }

            genreBoard.sort((a, b) => b.score - a.score);
            
            gameBoard[genre] = genreBoard;
            newLeaderboards[game as keyof Omit<Leaderboards, 'descriptionQuiz'>] = gameBoard;

            return newLeaderboards;
        });
    }
  };


  const handleRateQuiz = async (quizId: string, rating: number) => {
    if (!isAuthenticated) {
        handleShowNotification(t('quizResult.loginToRate'));
        return;
    }
    try {
        const response = await fetch(`/api/quizzes/${quizId}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating }),
        });
        if (!response.ok) throw new Error('Failed to rate quiz');
        const updatedQuiz = await response.json();
        setQuizzes(prev => prev.map(q => q.id === quizId ? updatedQuiz : q));
    } catch (error) {
        console.error("Error rating quiz:", error);
        handleShowNotification("Ошибка при отправке оценки.");
    }
  };

  const handleRestartQuiz = () => {
    if (activeQuiz) {
        handleStartQuiz(activeQuiz);
    }
  }
  
  const handleOpenReportDialog = (quiz: Quiz) => {
    setReportingQuiz(quiz);
  };

  const handleCloseReportDialog = () => {
      setReportingQuiz(null);
  };

  const handleSubmitReport = (quizId: string, reason: string) => {
      console.log(`Report submitted for quiz ${quizId}:`, reason);
      handleCloseReportDialog();
      alert(t('reportDialog.success'));
  };
  
  const handleShowNotification = (message: string) => {
    setNotification(message);
    setNotificationKey(prev => prev + 1);
  };

  const handleLogout = () => {
    logout();
    handleBackToList();
  }

  const isPlaying = useMemo(() => [
    AppView.PLAY,
    AppView.MOVIE_QUIZ,
    AppView.SERIES_QUIZ,
    AppView.MOVIE_RATING_GAME,
    AppView.SERIES_SEASON_RATING_GAME,
    AppView.DIRECTOR_QUIZ,
    AppView.YEAR_QUIZ,
    AppView.ACTOR_QUIZ,
    AppView.DESCRIPTION_QUIZ,
    AppView.SERIES_SORTING_GAME,
    AppView.SERIES_ACTOR_QUIZ,
    AppView.SERIES_DESCRIPTION_QUIZ,
  ].includes(currentView), [currentView]);

  const renderView = () => {
    switch(currentView) {
      case AppView.LOGIN:
        return <LoginScreen onBack={handleBackToList} />;
      case AppView.CREATE:
        return <CreateQuiz onSaveQuiz={handleSaveQuiz} onBack={handleBackToList} />;
      case AppView.EDIT:
        return <CreateQuiz 
            onSaveQuiz={handleUpdateQuiz} 
            onBack={handleBackToList} 
            quizToEdit={editingQuiz} 
        />;
      case AppView.STATS:
        if (statsQuiz) {
            return <QuizStatsComponent quiz={statsQuiz} onBack={handleBackToList} />;
        }
        return null;
      case AppView.PLAY:
        if (activeQuiz) {
            return <QuizPlayer quiz={activeQuiz} onFinish={handleFinishQuiz} onBack={handleBackToList} onReportQuiz={handleOpenReportDialog} />;
        }
        return null;
      case AppView.RESULT:
        if (activeQuiz) {
            return <QuizResult 
                quiz={activeQuiz} 
                userAnswers={lastAnswers}
                onRestart={handleRestartQuiz}
                onBackToList={handleBackToList}
                onRateQuiz={handleRateQuiz}
                isAuthenticated={isAuthenticated}
            />;
        }
        return null;
      case AppView.MOVIE_QUIZ:
        return <MovieQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.SERIES_QUIZ:
        return <SeriesQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.MOVIE_RATING_GAME:
        return <MovieRatingGamePlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.SERIES_SEASON_RATING_GAME:
        return <SeriesSeasonRatingGamePlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.DIRECTOR_QUIZ:
        return <DirectorQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.YEAR_QUIZ:
        return <YearQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.ACTOR_QUIZ:
        return <ActorQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.DESCRIPTION_QUIZ:
        return <DescriptionQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.SERIES_SORTING_GAME:
        return <SeriesSortingGamePlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} />;
      case AppView.SERIES_ACTOR_QUIZ:
        return <SeriesActorQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.SERIES_DESCRIPTION_QUIZ:
        return <SeriesDescriptionQuizPlayer onBack={handleBackToList} genre={activeMovieGameOptions!.genre} onGameOver={handleGameOver} />;
      case AppView.USER_PROFILE:
        return <UserProfile 
            playHistory={playHistory} 
            createdQuizzesCount={myQuizzesCount} 
            onBack={handleBackToList}
            gameStats={gameStats}
            onLogout={handleLogout}
        />;
      case AppView.LIST:
      default:
        return <QuizList 
          quizzes={quizzes} 
          onStartQuiz={handleStartQuiz} 
          onCreateQuiz={handleCreateQuiz}
          onStartMovieQuiz={handleStartMovieQuiz}
          onStartSeriesQuiz={handleStartSeriesQuiz}
          onStartMovieRatingGame={handleStartMovieRatingGame}
          onStartSeriesSeasonRatingGame={handleStartSeriesSeasonRatingGame}
          onStartDirectorQuiz={handleStartDirectorQuiz}
          onStartYearQuiz={handleStartYearQuiz}
          onStartActorQuiz={handleStartActorQuiz}
          onStartDescriptionQuiz={handleStartDescriptionQuiz}
          onStartSeriesSortingGame={handleStartSeriesSortingGame}
          onStartSeriesActorQuiz={handleStartSeriesActorQuiz}
          onStartSeriesDescriptionQuiz={handleStartSeriesDescriptionQuiz}
          onViewStats={handleViewStats}
          onDeleteQuiz={handleDeleteQuiz}
          onEditQuiz={handleStartEditQuiz}
          onReportQuiz={handleOpenReportDialog}
          onShowNotification={handleShowNotification}
          isMyQuiz={isMyQuiz}
          userId={user?.id || null}
          leaderboards={leaderboards}
          isAuthenticated={isAuthenticated}
        />;
    }
  }

  return (
    <div className="relative min-h-screen">
      {!isPlaying && currentView !== AppView.LOGIN && <Header onViewProfile={handleViewProfile} />}
      {renderView()}
      {confirmation && (
        <ConfirmationDialog 
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onCancel={() => setConfirmation(null)}
            isDestructive={confirmation.isDestructive}
            confirmButtonText={confirmation.confirmText}
        />
      )}
      {reportingQuiz && (
        <ReportDialog
            quiz={reportingQuiz}
            onClose={handleCloseReportDialog}
            onSubmit={handleSubmitReport}
        />
      )}
      {notification && (
        <Notification
          key={notificationKey}
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default App;