import express from 'express';
import * as authController from '../controllers/auth.js';
import { register, login, refresh, logout } from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema } from '../validation/user.js';
import { sendResetEmail } from '../controllers/auth.js';
import { resetEmailSchema } from '../validation/user.js';
import { resetPwdSchema } from '../validation/user.js';

const router = express.Router();

router.post('/register', validateBody(registerUserSchema), register);
router.post('/login', validateBody(loginUserSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post(
  '/send-reset-email',
  validateBody(resetEmailSchema),
  sendResetEmail,
);
router.post(
  '/reset-pwd',
  validateBody(resetPwdSchema),
  authController.resetPassword,
);

export const authRouter = router;
