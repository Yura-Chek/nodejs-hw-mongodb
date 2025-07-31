import express from 'express';
import { register, login, refresh } from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema } from '../validation/user.js';

const router = express.Router();

router.post('/register', validateBody(registerUserSchema), register);
router.post('/login', validateBody(loginUserSchema), login);
router.post('/refresh', refresh);

export const authRouter = router;
