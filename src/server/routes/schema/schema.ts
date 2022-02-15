import { Request, Response } from 'express'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'

export const schemaHandler =
	(schema: Record<string, any>) =>
	async (_: Request, response: Response): Promise<void> => {
		response
			.status(HTTPStatusCode.OK)
			.header('Content-Type', 'application/schema+json; charset=utf-8')
			.send(JSON.stringify(schema, null, 2))
			.end()
	}
