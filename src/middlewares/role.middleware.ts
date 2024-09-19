import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../exception/api-error';
import { tokenService } from '../services/token.service';

export const roleMiddleware = (roles: Role[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		if (req.method === 'OPTIONS') {
			return next();
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

			const { roles: userRoles } = userData as { roles?: Role[] };

			let hasRole = false;

			userRoles?.forEach(role => {
				if (roles.includes(role)) {
					hasRole = true;
				}
			});

			if (!hasRole) {
				throw ApiError.AccessDeniedError();
			}

			next();
		} catch (error) {
			next(ApiError.AccessDeniedError());
		}
	};
};
