import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../exception/api-error';
import { authService } from '../services/auth.service';
import { tokenService } from '../services/token.service';

class AuthController {
	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, password } = req.body;

			const userData = await authService.login(email, password);

			tokenService.saveTokenToCookie(req, res, next, userData.refreshToken);

			const { refreshToken: _, ...userResponse } = userData;

			return res.json(userResponse);
		} catch (error) {
			next(error);
		}
	}

	async logout(req: Request, res: Response, next: NextFunction) {
		try {
			const { refreshToken } = req.cookies;

			if (!refreshToken) throw ApiError.BadRequest('Token not found');

			const token = await authService.logout(refreshToken);

			if (!token) throw new Error('Logout process error');

			res.clearCookie('refreshToken');

			res.status(200).json({ message: 'Logout successful' });
		} catch (error) {
			next(error);
		}
	}

	async refresh(req: Request, res: Response, next: NextFunction) {
		try {
			const { refreshToken } = req.cookies;

			const userData = await authService.refresh(refreshToken);

			tokenService.saveTokenToCookie(req, res, next, userData.refreshToken);

			const { refreshToken: _, ...userResponse } = userData;

			return res.json(userResponse);
		} catch (error) {
			next(error);
		}
	}
}

export const authController = new AuthController();
