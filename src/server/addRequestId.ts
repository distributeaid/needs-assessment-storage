import { NextFunction, Request, Response } from 'express'
import { v4 } from 'uuid'

export const addRequestId = (
	_: Request,
	res: Response,
	next: NextFunction,
): void => {
	res.header('X-Request-Id', v4())
	next()
}

export const getRequestId = (res: Response): string => res.get('X-Request-Id')
