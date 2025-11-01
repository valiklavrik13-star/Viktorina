import mongoose, { Document, Schema } from 'mongoose';
import { Quiz as IQuiz, QuizCategory, FeedbackDisplayCondition } from '../../types';

const QuestionFeedbackSchema = new Schema({
    text: { type: String, required: true },
    displayCondition: { type: String, enum: Object.values(FeedbackDisplayCondition), required: true },
}, { _id: false });

const QuestionSchema = new Schema({
  id: { type: String, required: true },
  questionText: { type: String },
  image: { type: String },
  options: [{ type: String, required: true }],
  correctAnswerIndex: [{ type: Number, required: true }],
  timeLimit: { type: Number },
  feedback: { type: QuestionFeedbackSchema },
}, { _id: false });

const QuestionStatsSchema = new Schema({
    attempts: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    answers: { type: Map, of: Number, default: {} }
}, { _id: false });

const QuizStatsSchema = new Schema({
    totalPlays: { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 },
    questionStats: { type: Map, of: QuestionStatsSchema, default: {} }
}, { _id: false });

const QuizSchema = new Schema({
  creatorId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, enum: Object.values(QuizCategory), required: true },
  questions: [QuestionSchema],
  ratings: [{ type: Number }],
  averageRating: { type: Number, default: 0 },
  stats: { type: QuizStatsSchema, default: () => ({}) },
  playedBy: [{ type: String }],
  timeLimit: { type: Number },
  playUntilFirstMistake: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

QuizSchema.virtual('id').get(function() {
  return this._id.toHexString();
});


export type QuizDocument = IQuiz & Document;

export const Quiz = mongoose.model<QuizDocument>('Quiz', QuizSchema);