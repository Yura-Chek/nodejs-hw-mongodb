import express from 'express';
import { register } from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema } from '../validation/user.js';

const router = express.Router();

router.post('/register', validateBody(registerUserSchema), register);

export const authRouter = router;
