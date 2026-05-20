import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import { verifyRefreshToken, generateAccessToken } from "../../utils/jwt";

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const user = await AuthService.register(email, password, name);
  res.json(user);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await AuthService.login(email, password);
  res.json({ user, accessToken, refreshToken });
};

export const refresh = async (req: Request, res: Response) => {
  const { token } = req.body;
  const payload = verifyRefreshToken(token) as any;
  const accessToken = generateAccessToken({ id: payload.id, role: payload.role });
  res.json({ accessToken });
};

export const logout = async (_req: Request, res: Response) => {
  res.json({ message: "Logged out" });
};
