import { NextFunction, Request, Response } from 'express'
import { ulid } from '../ulid'

export const addRequestId = (
	_: Request,
	res: Response,
	next: NextFunction,
): void => {
	res.header('X-Request-Id', ulid())
	next()
}

export const getRequestId = (res: Response): string => res.get('X-Request-Id')
