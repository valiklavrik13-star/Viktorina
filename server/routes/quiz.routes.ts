import express from 'express';
import { Quiz, QuizDocument } from '../models/quiz.model';
import { Question } from '../../types';

const router = express.Router();

// GET all quizzes (only public)
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isPrivate: { $ne: true } }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single quiz by ID
router.get('/:id', async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      // Here you might add logic to check if the user has permission for private quizzes
      res.json(quiz);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
});

// POST a new quiz
router.post('/', async (req, res) => {
  const { title, category, questions, creatorId, timeLimit, playUntilFirstMistake, isPrivate } = req.body;

  const newQuiz = new Quiz({
    title,
    category,
    questions,
    creatorId,
    timeLimit,
    playUntilFirstMistake,
    isPrivate,
    stats: {
        totalPlays: 0,
        totalCorrectAnswers: 0,
        questionStats: questions.reduce((acc: any, q: Question) => {
            acc[q.id] = { attempts: 0, correct: 0, answers: {} };
            return acc;
        }, {})
    }
  });

  try {
    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) a quiz
router.put('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        
        const { title, category, questions, timeLimit, playUntilFirstMistake, isPrivate } = req.body;
        
        quiz.title = title;
        quiz.category = category;
        quiz.questions = questions;
        quiz.timeLimit = timeLimit;
        quiz.playUntilFirstMistake = playUntilFirstMistake;
        quiz.isPrivate = isPrivate;

        // Reset stats upon editing
        quiz.stats = {
            totalPlays: 0,
            totalCorrectAnswers: 0,
            questionStats: questions.reduce((acc: any, q: Question) => {
                acc[q.id] = { attempts: 0, correct: 0, answers: {} };
                return acc;
            }, {})
        };
        quiz.playedBy = [];
        quiz.ratings = [];
        quiz.averageRating = 0;
        
        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a quiz
router.delete('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});


// POST a rating for a quiz
router.post('/:id/rate', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        
        const { rating } = req.body;
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Invalid rating value' });
        }
        
        quiz.ratings.push(rating);
        quiz.averageRating = quiz.ratings.reduce((acc, curr) => acc + curr, 0) / quiz.ratings.length;
        
        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// POST quiz results (play)
router.post('/:id/play', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const { answers, userId } = req.body;
        
        if (quiz.playedBy.includes(userId)) {
            return res.status(200).json({ message: 'User has already played this quiz. Stats not updated.'});
        }
        
        quiz.playedBy.push(userId);
        quiz.stats.totalPlays += 1;
        let correctAnswersInThisPlay = 0;

        const questionStatsMap = quiz.stats.questionStats as Map<string, { attempts: number; correct: number; answers: Map<string, number> }>;

        Object.entries(answers).forEach(([questionId, userAnswer]) => {
            const question = quiz.questions.find(q => q.id === questionId);
            if (question) {
                const qStats = questionStatsMap.get(questionId) || { attempts: 0, correct: 0, answers: new Map<string, number>() };
                
                qStats.attempts += 1;
                
                const answerIndices = Array.isArray(userAnswer) ? (userAnswer as number[]) : (typeof userAnswer === 'number' ? [userAnswer] : []);
                
                answerIndices.forEach(idx => {
                    const currentCount = qStats.answers.get(String(idx)) || 0;
                    qStats.answers.set(String(idx), currentCount + 1);
                });

                const isCorrect = Array.isArray(question.correctAnswerIndex) &&
                                  question.correctAnswerIndex.length === answerIndices.length &&
                                  [...question.correctAnswerIndex].sort().toString() === [...answerIndices].sort().toString();

                if (isCorrect) {
                    qStats.correct += 1;
                    correctAnswersInThisPlay += 1;
                }
                
                questionStatsMap.set(questionId, qStats);
            }
        });

        quiz.stats.totalCorrectAnswers += correctAnswersInThisPlay;
        
        quiz.markModified('stats'); 

        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});


export default router;