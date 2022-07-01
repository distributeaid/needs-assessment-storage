import { Static } from '@sinclair/typebox'
import { Request, Response } from 'express'
import { correctResponse } from '../../../correction/correctResponse.js'
import { Correction } from '../../../form/correction.js'
import { Submission } from '../../../form/submission.js'
import { errorsToProblemDetail } from '../../../input-validation/errorsToProblemDetail.js'
import { validateWithTypebox } from '../../../input-validation/validateWithTypebox.js'
import { Store } from '../../../storage/store.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { respondWithProblem } from '../../response/problem.js'
import { idParamSchema } from '../idParamSchema.js'

const validateInput = validateWithTypebox(idParamSchema)

export const assessmentGetHandler =
	({
		endpoint,
		submissionStorage,
		correctionStorage,
	}: {
		endpoint: URL
		submissionStorage: Store<Static<typeof Submission>>
		correctionStorage: Store<Static<typeof Correction>>
	}) =>
	async (request: Request, response: Response): Promise<void> => {
		const valid = validateInput(request.params)
		if ('errors' in valid) {
			return respondWithProblem(
				request,
				response,
				errorsToProblemDetail(valid.errors),
			)
		}
		const submission = await submissionStorage.get(valid.value.id)
		if (submission === undefined) {
			return respondWithProblem(request, response, {
				title: `Submission ${valid.value.id} not found!`,
				status: HTTPStatusCode.NotFound,
			})
		}

		const corrections = await correctionStorage.findAll({
			submission: new URL(
				`./assessment/${valid.value.id}`,
				endpoint,
			).toString(),
		})

		const correctedResponse = correctResponse({
			response: submission.data.response,
			corrections: corrections.map(({ data: { response } }) => response),
		})

		const correctedSubmission: Static<typeof Submission> = {
			...submission.data,
			response: correctedResponse,
		}

		response
			.status(HTTPStatusCode.OK)
			.header('Content-Type', 'application/json; charset=utf-8')
			.header('etag', `${corrections.length + 1}`)
			.send(JSON.stringify(correctedSubmission, null, 2))
			.end()
	}
