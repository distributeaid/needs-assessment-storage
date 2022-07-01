import { Static } from '@sinclair/typebox'
import { EventEmitter } from 'events'
import { Request, Response } from 'express'
import { URL } from 'url'
import { events } from '../../../events.js'
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

export const assessmentSubmissionHandler = ({
	endpoint,
	formStorage,
	submissionStorage,
	omnibus,
}: {
	endpoint: URL
	formStorage: Store<Form>
	submissionStorage: Store<Static<typeof Submission>>
	omnibus: EventEmitter
}): ((request: Request, response: Response) => Promise<void>) => {
	const input = Submission

	const validate = validateWithTypebox(input)

	const formIdRegEx = new RegExp(
		`^${new URL(
			'./form/',
			endpoint,
		).toString()}(?<id>[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$)`,
	)

	return async (request, response) => {
		const validBody = validate(request.body)
		if ('errors' in validBody) {
			return respondWithProblem(
				request,
				response,
				errorsToProblemDetail(validBody.errors),
			)
		}

		// Extract formId
		const formId = formIdRegEx.exec(validBody.value.form)?.groups?.id

		// Validate id
		if (formId === undefined)
			return respondWithProblem(request, response, {
				status: HTTPStatusCode.BadRequest,
				title: `Invalid ID "${validBody.value.form}" supplied.`,
			})

		// Load form
		const form = formCache[formId] ?? (await formStorage.get(formId))?.data
		if (form === undefined)
			return respondWithProblem(request, response, {
				title: `Invalid form.`,
				status: HTTPStatusCode.NotFound,
			})
		formCache[formId] = form

		// Make sure response is for the given form
		if (form.$id !== validBody.value.form) {
			return respondWithProblem(request, response, {
				title: `Response form ${validBody.value.form} does not match form ID ${form.$id}.`,
				status: HTTPStatusCode.BadRequest,
			})
		}

		// Validate response against form
		const validResponse = validateResponse({
			form,
			response: validBody.value.response,
		})
		if (!validResponse.valid) {
			return respondWithProblem(request, response, {
				title: `Response is not valid.`,
				detail: JSON.stringify(validResponse.validation),
				status: HTTPStatusCode.BadRequest,
			})
		}

		const id = ulid()
		await submissionStorage.persist(id, validBody.value)
		response
			.status(HTTPStatusCode.Created)
			.header('Location', new URL(`./assessment/${id}`, endpoint).toString())
			.header('ETag', '1')
			.end()
		omnibus.emit(events.assessment_created, id, validBody.value, form)
	}
}
