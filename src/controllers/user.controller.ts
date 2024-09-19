import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../exception/api-error';
import { tokenService } from '../services/token.service';
import { usersService } from '../services/user.service';

class UserController {
	async registration(req: Request, res: Response, next: NextFunction) {
		try {
			const validationErrors = validationResult(req);

			if (!validationErrors.isEmpty()) {
				throw ApiError.BadRequest('Validation error', validationErrors);
			}

			const data = req.body;

			const userData = await usersService.create(data);

			tokenService.saveTokenToCookie(req, res, next, userData.refreshToken);

			const { refreshToken: _, ...userResponse } = userData;

			return res.json(userResponse);
		} catch (error) {
			next(error);
		}
	}

	async activate(req: Request, res: Response, next: NextFunction) {
		try {
			const activationLink = req.params.link;

			await usersService.activate(activationLink);

			if (!process.env.CLIENT_URL) throw new Error('CLIENT_URL is not defined');

			return res.redirect(process.env.CLIENT_URL);
		} catch (error) {
			next(error);
		}
	}

	async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const users = await usersService.getAllUsers();
			return res.json(users);
		} catch (error) {
			next(error);
		}
	}
}

export const userController = new UserController();
