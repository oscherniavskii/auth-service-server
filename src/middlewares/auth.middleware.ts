import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { ApiError } from '../exception/api-error';
import { tokenService } from '../services/token.service';

interface CustomRequest extends Request {
	user?: JwtPayload | string;
}

export const authMiddleware = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction
) => {
	if (req.method === 'OPTIONS') {
		next();
	}

	try {
		if (!req.headers.authorization) {
			throw ApiError.UnauthorizedError();
		}

		const token = tokenService.getTokenFromBearer(req.headers.authorization);

		if (!token) {
			throw ApiError.UnauthorizedError();
		}

		const userData = tokenService.validateAccessToken(token);

		if (!userData) {
			throw ApiError.UnauthorizedError();
		}

		req.user = userData;

		next();
	} catch (error) {
		next(ApiError.UnauthorizedError());
	}
};
