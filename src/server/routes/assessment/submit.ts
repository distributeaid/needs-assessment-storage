import { Type } from '@sinclair/typebox'
import { EventEmitter } from 'events'
import { Request, Response } from 'express'
import { URL } from 'url'
import { events } from '../../../events'
import { Form } from '../../../form/form'
import type { Submission } from '../../../form/submission'
import { validateResponse } from '../../../form/validateResponse'
import { errorsToProblemDetail } from '../../../input-validation/errorsToProblemDetail'
import { validateWithTypebox } from '../../../input-validation/validateWithTypebox'
import { Store } from '../../../storage/store'
import { ulid } from '../../../ulid'
import { HTTPStatusCode } from '../../response/HttpStatusCode'
import { respondWithProblem } from '../../response/problem'

const formCache: Record<string, Form> = {}

export const assessmentSubmissionHandler = ({
	origin,
	formStorage,
	submissionStorage,
	omnibus,
}: {
	origin: URL
	formStorage: Store<Form>
	submissionStorage: Store<Submission>
	omnibus: EventEmitter
}): ((request: Request, response: Response) => Promise<void>) => {
	const input = Type.Object(
		{
			form: Type.String({
				pattern: `^${new URL(
					'./form/',
					origin,
				).toString()}[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$`,
			}),
			response: Type.Record(
				Type.String(),
				Type.Record(
					Type.String(),
					Type.Union([Type.String(), Type.Array(Type.String())]),
				),
			),
		},
		{ additionalProperties: false },
	)

	const validate = validateWithTypebox(input)

	const formIdRegEx = new RegExp(
		`^${new URL(
			'./form/',
			origin,
		).toString()}(?<id>[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$)`,
	)

	return async (request, response) => {
		const validBody = validate(request.body)
		if ('errors' in validBody) {
			return respondWithProblem(
				response,
				errorsToProblemDetail(validBody.errors),
			)
		}

		// Extract formId
		const formId = formIdRegEx.exec(validBody.value.form)?.groups?.id as string

		// Load form
		const form = formCache[formId] ?? (await formStorage.get(formId))
		if (form === undefined)
			return respondWithProblem(response, {
				title: `Invalid form.`,
				status: HTTPStatusCode.NotFound,
			})

		// Make sure response is for the given form
		if (form.$id !== validBody.value.form) {
			return respondWithProblem(response, {
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
			return respondWithProblem(response, {
				title: `Response is not valid.`,
				detail: JSON.stringify(validResponse.validation),
				status: HTTPStatusCode.BadRequest,
			})
		}

		const id = ulid()
		omnibus.emit(events.assessment_created, id, validBody.value)
		await submissionStorage.persist(id, validBody.value)
		response
			.status(HTTPStatusCode.Created)
			.header('Location', new URL(`./submission/${id}`, origin).toString())
			.end()
	}
}
