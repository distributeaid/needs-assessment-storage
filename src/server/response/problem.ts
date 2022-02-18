import { Response } from 'express'
import { ProblemDetail } from '../../input-validation/errorsToProblemDetail.js'
import { HTTPStatusCode } from './HttpStatusCode.js'

export const respondWithProblem = (
	response: Response,
	problem: ProblemDetail & { status: HTTPStatusCode },
): void => {
	response
		.status(problem.status)
		// @see https://datatracker.ietf.org/doc/html/rfc7807#section-3
		.header('Content-Type', 'application/problem+json; charset=utf-8')
		.header('Access-Control-Allow-Origin', '*')
		.send(JSON.stringify(problem))
		.end()
}
