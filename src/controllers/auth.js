import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../services/auth.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';
import {
  findUserByEmail,
  updatePasswordAndClearSession,
} from '../services/auth.js';
import { getEnvVar } from '../utils/getEnvVar.js';

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken } = await loginUser(email, password);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: { accessToken },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const { accessToken } = await refreshSession(req, res);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  await logoutUser(refreshToken);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.sendStatus(204);
});

export const sendResetEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const token = jwt.sign({ email }, getEnvVar('JWT_SECRET'), {
    expiresIn: '5m',
  });
  const resetUrl = `${getEnvVar('APP_DOMAIN')}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: getEnvVar('SMTP_HOST'),
    port: Number(getEnvVar('SMTP_PORT')),
    secure: true,
    auth: {
      user: getEnvVar('SMTP_USER'),
      pass: getEnvVar('SMTP_PASSWORD'),
    },
  });

  const mail = {
    from: getEnvVar('SMTP_FROM'),
    to: email,
    subject: 'Reset your password',
    html: `<p>To reset your password, click the link below:</p>
           <a href="${resetUrl}">${resetUrl}</a>
           <p>This link will expire in 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mail);
  } catch (err) {
    console.error('Error sending email:', err);
    throw createHttpError(500, {
      message: 'Failed to send the email, please try again later.',
      reason: err.message,
    });
  }

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
});

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  let payload;
  try {
    const secret = getEnvVar('JWT_SECRET');
    payload = jwt.verify(token, secret);
  } catch (error) {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const userEmail = payload.email;
  if (!userEmail) {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await updatePasswordAndClearSession(userEmail, password);
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
