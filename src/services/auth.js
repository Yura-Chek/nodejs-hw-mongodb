import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';

const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '30d';

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user.toJSON();
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  await Session.deleteMany({ userId: user._id });

  const payload = { id: user._id, email: user.email };

  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken, refreshToken };
};

export const refreshSession = async (req) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token is missing');
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  } catch (err) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  await Session.findOneAndDelete({ sid: payload.sid });

  const userId = payload.uid;

  const newPayload = { uid: userId, sid: crypto.randomUUID() };

  const accessToken = jwt.sign(newPayload, process.env.ACCESS_SECRET, {
    expiresIn: '15m',
  });

  const newRefreshToken = jwt.sign(newPayload, process.env.REFRESH_SECRET, {
    expiresIn: '30d',
  });

  await Session.create({
    uid: userId,
    sid: newPayload.sid,
  });

  req.res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return { accessToken };
};
