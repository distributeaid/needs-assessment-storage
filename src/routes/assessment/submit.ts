import { Request, Response } from 'express'
import { URL } from 'url'
import { HTTPStatusCode } from '../../server/response/HttpStatusCode'
import { respondWithProblem } from '../../server/response/problem'

export const assessmentSubmissionHandler =
	({ origin }: { origin: URL }) =>
	async (_: Request, response: Response): Promise<void> => {
		console.debug(origin) // FIXME: remove
		return respondWithProblem(response, {
			title: `Invalid assessment.`,
			status: HTTPStatusCode.BadRequest,
		})
	}
