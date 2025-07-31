import { registerUser } from '../services/auth.js';
import * as authService from '../services/auth.js';
import asyncHandler from 'express-async-handler';

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken } = await authService.loginUser(
    email,
    password,
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
};

export const refresh = asyncHandler(async (req, res) => {
  const { accessToken } = await authService.refreshSession(req);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.sendStatus(204);
});
