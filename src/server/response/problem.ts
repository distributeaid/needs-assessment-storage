import { Request, Response } from 'express'
import { ProblemDetail } from '../../input-validation/errorsToProblemDetail.js'
import { HTTPStatusCode } from './HttpStatusCode.js'

export const respondWithProblem = (
	request: Request,
	response: Response,
	problem: ProblemDetail & { status: HTTPStatusCode },
): void => {
	response
		.status(problem.status)
		// @see https://datatracker.ietf.org/doc/html/rfc7807#section-3
		.header('Content-Type', 'application/problem+json; charset=utf-8')
		.header('Access-Control-Allow-Origin', request.headers.origin)
		.send(JSON.stringify(problem))
		.end()
}
