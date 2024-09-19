import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '..';
import { ApiError } from '../exception/api-error';
import { mailService } from '../services/mail.service';
import { tokenService } from '../services/token.service';
import { UserDto } from '../types/user.types';

class UsersService {
	async create(data: UserDto) {
		const candidate = await prisma.user.findUnique({
			where: {
				email: data.email
			}
		});

		if (candidate)
			throw ApiError.BadRequest('User with this email already exists');

		const hashPassword = await argon2.hash(data.password);

		const activationLink = uuidv4();

		const user = await prisma.user.create({
			data: {
				email: data.email,
				password: hashPassword,
				name: data.name ? data.name : null,
				isActivated: false,
				activationLink
			},
			select: {
				id: true,
				email: true,
				name: true,
				roles: true,
				isActivated: true
			}
		});

		await mailService.sendActivationMail(
			data.email,
			`${process.env.API_URL}/api/user/activate/${activationLink}`
		);

		const tokens = tokenService.generateTokens(user.id, user.roles);

		if (!tokens) throw new Error('Tokens generating error');

		await tokenService.saveToken(user.id, tokens.refreshToken);

		return { ...tokens, user };
	}

	async activate(activationLink: string) {
		const user = await prisma.user.findFirst({
			where: {
				activationLink
			}
		});

		if (!user) throw ApiError.BadRequest('Invalid activation link');

		const activeUser = await prisma.user.update({
			where: {
				id: user.id
			},
			data: {
				isActivated: true
			},
			select: {
				id: true,
				email: true,
				name: true,
				roles: true,
				isActivated: true
			}
		});

		return activeUser;
	}

	async getAllUsers() {
		return await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				roles: true,
				isActivated: true
			}
		});
	}
}

export const usersService = new UsersService();
