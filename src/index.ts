import { PrismaClient } from '@prisma/client';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRouter } from './routes/auth.router';
import { usersRouter } from './routes/user.router';
import { logger } from './utils/log';
// import cookieParser from 'cookie-parser';

export const prisma = new PrismaClient();

// .env support
dotenv.config();

const PORT = process.env.PORT || 5000;

// Init Express
const app = express();

// Headers protect by Helmet
app.use(helmet());

// gzip support
app.use(compression());

// json support
app.use(express.json());

//Cookie support
app.use(cookieParser());

//CORS support
app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL
	})
);

// Main function for express routing ----------------------------------------------------
async function main() {
	// Use Auth router
	app.use('/api/auth', authRouter);

	// Use User router
	app.use('/api/user', usersRouter);

	// Wrong routes processing
	app.all('*', (req: Request, res: Response) => {
		res.status(404).json({ message: 'Route not found' });
	});

	// Server errors processing
	app.use(errorMiddleware);

	//Server start
	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`);
	});
}
// ---------------------------------------------------------------------------------------

// Run main func
main()
	.then(async () => {
		await prisma.$connect();
	})
	.catch(async e => {
		logger.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
