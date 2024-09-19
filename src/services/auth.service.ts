import * as argon2 from 'argon2';
import { prisma } from '..';
import { ApiError } from '../exception/api-error';
import { tokenService } from '../services/token.service';

class AuthService {
	async login(email: string, password: string) {
		const currentUser = await prisma.user.findUnique({
			where: {
				email
			}
		});

		if (!currentUser) {
			throw ApiError.BadRequest(`User with email ${email} not found`);
		}

		const isValidPass = await argon2.verify(currentUser.password, password);

		if (!isValidPass) {
			throw ApiError.BadRequest(`Incorrect password`);
		}

		const tokens = tokenService.generateTokens(
			currentUser.id,
			currentUser.roles
		);

		if (!tokens) throw new Error('Tokens generating error');

		await tokenService.saveToken(currentUser.id, tokens.refreshToken);

		const user = await prisma.user.findUnique({
			where: {
				email
			},
			select: {
				id: true,
				email: true,
				name: true,
				roles: true,
				isActivated: true
			}
		});

		return { ...tokens, user };
	}

	async logout(refreshToken: string) {
		const token = await tokenService.removeToken(refreshToken);
		return token;
	}

	async refresh(refreshToken: string) {
		if (!refreshToken) throw ApiError.UnauthorizedError();

		const userData = tokenService.validateRefreshToken(refreshToken);

		const tokenFromDB = await tokenService.findToken(refreshToken);

		if (!userData || !tokenFromDB) throw ApiError.UnauthorizedError();

		const user = await prisma.user.findUnique({
			where: {
				id: tokenFromDB.userId
			},
			select: {
				id: true,
				email: true,
				name: true,
				roles: true,
				isActivated: true
			}
		});

		if (!user) throw new Error('Tokens generating error');

		const tokens = tokenService.generateTokens(user.id, user.roles);

		if (!tokens) throw new Error('Tokens generating error');

		await tokenService.saveToken(user.id, tokens.refreshToken);

		return { ...tokens, user };
	}
}

export const authService = new AuthService();
