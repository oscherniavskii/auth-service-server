import { Role, Token } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../';

class TokenService {
	generateTokens = (id: number, roles: Role[]) => {
		const payload = {
			id,
			roles
		};

		if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET)
			throw new Error('JWT secrets is not defined');

		const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
			expiresIn: process.env.ACCESS_TIME
		});

		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
			expiresIn: process.env.REFRESH_TIME
		});

		return {
			accessToken,
			refreshToken
		};
	};

	async saveToken(userId: number, refreshToken: string): Promise<Token> {
		const tokenData = await prisma.token.findUnique({
			where: {
				userId: userId
			}
		});

		if (tokenData) {
			const token = await prisma.token.update({
				where: {
					userId: userId
				},
				data: {
					refreshToken
				}
			});

			return token;
		}

		const token = await prisma.token.create({
			data: {
				userId,
				refreshToken
			}
		});

		return token;
	}

	async removeToken(refreshToken: string) {
		const tokenData = await prisma.token.delete({
			where: {
				refreshToken
			}
		});

		return tokenData;
	}

	validateAccessToken(token: string) {
		try {
			if (!process.env.JWT_ACCESS_SECRET)
				throw new Error('JWT_ACCESS_SECRET is not defined');

			const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

			return userData;
		} catch (error) {
			return null;
		}
	}

	validateRefreshToken(token: string) {
		try {
			if (!process.env.JWT_REFRESH_SECRET)
				throw new Error('JWT_REFRESH_SECRET is not defined');

			const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

			return userData;
		} catch (error) {
			return null;
		}
	}

	async findToken(refreshToken: string) {
		const tokenData = await prisma.token.findUnique({
			where: {
				refreshToken
			}
		});

		return tokenData;
	}

	saveTokenToCookie(
		req: Request,
		res: Response,
		next: NextFunction,
		refreshToken: string
	) {
		if (!process.env.COOKIE_TIME) throw new Error('COOKIE_TIME is not defined');

		res.cookie('refreshToken', refreshToken, {
			maxAge: +process.env.COOKIE_TIME,
			httpOnly: true
			// secure: true //For https
		});
	}

	getTokenFromBearer(bearer: string) {
		return bearer.split(' ')[1];
	}
}

export const tokenService = new TokenService();
