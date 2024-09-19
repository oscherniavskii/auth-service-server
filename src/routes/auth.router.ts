import express from 'express';

import { authController } from '../controllers/auth.controller';

export const authRouter = express.Router();

authRouter.post('/login', authController.login);

authRouter.post('/logout', authController.logout);

authRouter.get('/refresh', authController.refresh);
