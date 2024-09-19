import express from 'express';
import { check } from 'express-validator';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const usersRouter = express.Router();

usersRouter.post(
	'/registration',
	[
		check('email', 'Email required!').isEmail(),
		check('password', 'Password must be at least 8 characters long!').isLength({
			min: 8
		}),
		check('name', 'Name should not be empty!').optional()
	],
	userController.registration
);

usersRouter.get('/activate/:link', userController.activate);

usersRouter.get(
	'/all',
	authMiddleware,
	// roleMiddleware(['ADMIN', 'MODERATOR']),
	userController.getAll
);
