import { Static } from '@sinclair/typebox'
import { Request, Response } from 'express'
import { AuthContext } from '../../../authenticateRequest.js'
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
		const authContext = request.user as AuthContext
		if (!authContext.isAdmin)
			return respondWithProblem(request, response, {
				status: HTTPStatusCode.Forbidden,
				title: `Access denied for ${authContext.email}.`,
			})

		const valid = validateInput(request.params)
		if ('errors' in valid) {
			return respondWithProblem(
				request,
				response,
				errorsToProblemDetail(valid.errors),
			)
		}
		let submission: Static<typeof Submission> | undefined = undefined
		try {
			submission = (await submissionStorage.get(valid.value.id))?.data
		} catch (error) {
			console.error(`Failed to get submission`, valid.value.id, error)
		}
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
			response: submission.response,
			corrections: corrections.map(({ data: { response } }) => response),
		})

		const correctedSubmission: Static<typeof Submission> = {
			...submission,
			response: correctedResponse,
		}

		response
			.status(HTTPStatusCode.OK)
			.header('Content-Type', 'application/json; charset=utf-8')
			.header('etag', `${corrections.length + 1}`)
			.send(JSON.stringify(correctedSubmission, null, 2))
			.end()
	}
