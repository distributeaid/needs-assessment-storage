import { NextFunction, Request, Response } from 'express'

export const addVersion =
	(version: string) =>
	(_: Request, res: Response, next: NextFunction): void => {
		res.header('X-needs-assessment-storage-Backend-Version', version)
		next()
	}
