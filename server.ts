// FIX: Using `import express from 'express'` and fully qualifying types like `express.Request`
// is a robust way to avoid conflicts with global types (e.g., from the DOM library).
// FIX: Explicitly import Request and Response from express to resolve type ambiguity with DOM types.
// FIX: Import `Request` and `Response` types from `express` to avoid conflicts with global DOM types.
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './server/db';
import userRoutes from './server/routes/user.routes';
import quizRoutes from './server/routes/quiz.routes';
import path from 'path';
// FIX: Add url and path imports to define __dirname in an ES module environment.
import { fileURLToPath } from 'url';

dotenv.config();

// FIX: __dirname is not available in ES modules. This is a common workaround.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for images

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);

// Serve static files from the React app
// FIX: (Error on line 28) The type overload error is likely a side-effect of the global type conflicts.
// Correctly typing other express handlers should resolve this without changing this line.
app.use('/', express.static(__dirname));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// FIX: (Errors on lines 39, 48) Use fully qualified express types `express.Request` and `express.Response` to avoid collision with global DOM types which were causing overload and property not found errors.
// FIX: Use fully qualified express types to resolve type errors.
// FIX: Use the explicitly imported `Request` and `Response` types to prevent type collision with global DOM types.
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});