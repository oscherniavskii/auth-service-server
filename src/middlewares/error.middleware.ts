import { ErrorRequestHandler } from 'express';
import { ApiError } from '../exception/api-error';
import { logger } from '../utils/log';

export const errorMiddleware: ErrorRequestHandler = async (
	err,
	req,
	res,
	next
) => {
	if (err instanceof ApiError) {
		logger.error({
			message: err.message,
			errors: err.errors
		});
		return res.status(err.status).json({
			message: err.message,
			errors: err.errors
		});
	}

	logger.error(err);
	return res.status(500).json({ message: 'Unexpected server error' });
};
