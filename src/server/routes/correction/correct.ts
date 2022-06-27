import { Static } from '@sinclair/typebox'
import { EventEmitter } from 'events'
import { Request, Response } from 'express'
import { URL } from 'url'
import { events } from '../../../events.js'
import { Correction } from '../../../form/correction.js'
import { Form } from '../../../form/form.js'
import { Submission } from '../../../form/submission.js'
import { validateResponse } from '../../../form/validateResponse.js'
import { errorsToProblemDetail } from '../../../input-validation/errorsToProblemDetail.js'
import { validateWithTypebox } from '../../../input-validation/validateWithTypebox.js'
import { Store } from '../../../storage/store.js'
import { ulid } from '../../../ulid.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { respondWithProblem } from '../../response/problem.js'

const formCache: Record<string, Form> = {}
const submissionCache: Record<string, Static<typeof Submission>> = {}

export const assessmentCorrectionHandler = ({
	endpoint,
	formStorage,
	submissionStorage,
	correctionStorage,
	omnibus,
}: {
	endpoint: URL
	formStorage: Store<Form>
	submissionStorage: Store<Static<typeof Submission>>
	correctionStorage: Store<Static<typeof Correction>>
	omnibus: EventEmitter
}): ((request: Request, response: Response) => Promise<void>) => {
	const input = Correction

	const validate = validateWithTypebox(input)

	const submissionIdRegEx = new RegExp(
		`^${new URL(
			'./assessment/',
			endpoint,
		).toString()}(?<id>[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$)`,
	)

	const formIdRegEx = new RegExp(
		`^${new URL(
			'./form/',
			endpoint,
		).toString()}(?<id>[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$)`,
	)

	return async (request, response) => {
		const validBody = validate({
			...request.body,
			submissionVersion: parseInt(request.headers['if-match'] ?? '', 10),
		})
		if ('errors' in validBody) {
			return respondWithProblem(
				request,
				response,
				errorsToProblemDetail(validBody.errors),
			)
		}

		// Extract submissionId
		const submissionId = submissionIdRegEx.exec(validBody.value.submission)
			?.groups?.id

		// Validate id
		if (submissionId === undefined)
			return respondWithProblem(request, response, {
				status: HTTPStatusCode.BadRequest,
				title: `Invalid ID "${validBody.value.submission}" supplied.`,
			})

		// Load submission
		const submission =
			submissionCache[submissionId] ??
			(await submissionStorage.get(submissionId))?.data
		if (submission === undefined) {
			return respondWithProblem(request, response, {
				title: `Invalid submission.`,
				status: HTTPStatusCode.NotFound,
			})
		}

		// Load older corrections to build submission version
		const submissionVersion =
			(
				await correctionStorage.findAll({
					submission: validBody.value.submission,
				})
			).length + 1
		if (validBody.value.submissionVersion !== submissionVersion) {
			return respondWithProblem(request, response, {
				title: `Expected correction for submission version ${submissionVersion}, got ${validBody.value.submissionVersion}.`,
				status: HTTPStatusCode.Conflict,
			})
		}

		// Load form
		const formId = formIdRegEx.exec(submission.form)?.groups?.id
		if (formId === undefined)
			return respondWithProblem(request, response, {
				status: HTTPStatusCode.InternalError,
				title: `Invalid form ID "${formId}" retrieved from submission "${submissionId}".`,
			})
		const form = formCache[formId] ?? (await formStorage.get(formId))?.data
		if (form === undefined)
			return respondWithProblem(request, response, {
				title: `Invalid form.`,
				status: HTTPStatusCode.NotFound,
			})
		formCache[submissionId] = form

		// Validate corrected response against form
		const validResponse = validateResponse({
			form,
			response: validBody.value.response,
		})
		if (!validResponse.valid) {
			return respondWithProblem(request, response, {
				title: `Corrected response is not valid.`,
				detail: JSON.stringify(validResponse.validation),
				status: HTTPStatusCode.BadRequest,
			})
		}

		const id = ulid()
		await correctionStorage.persist(id, validBody.value)
		response
			.status(HTTPStatusCode.Created)
			.header('Location', new URL(`./correction/${id}`, endpoint).toString())
			.end()
		omnibus.emit(
			events.correction_created,
			id,
			validBody.value,
			form,
			submission,
		)
	}
}
