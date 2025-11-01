import express from 'express';
import { User } from '../models/user.model';
import { randomUUID } from 'crypto';

const router = express.Router();

// POST a new anonymous user
router.post('/', async (req, res) => {
  try {
    const newUserId = randomUUID();
    const newUser = new User({ userId: newUserId });
    await newUser.save();
    res.status(201).json({ userId: newUserId });
  } catch (error: any) {
    // In case of a rare UUID collision, we could retry, but it's highly unlikely.
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

export default router;
