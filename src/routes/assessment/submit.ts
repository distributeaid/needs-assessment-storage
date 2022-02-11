import { Type } from '@sinclair/typebox'
import { Request, Response } from 'express'
import { URL } from 'url'
import { Form } from '../../form/form'
import type { Submission } from '../../form/submission'
import { errorsToProblemDetail } from '../../input-validation/errorsToProblemDetail'
import { validateWithTypebox } from '../../input-validation/validateWithTypebox'
import { HTTPStatusCode } from '../../server/response/HttpStatusCode'
import { respondWithProblem } from '../../server/response/problem'
import { Store } from '../../storage/store'
import { ulid } from '../../ulid'

const formCache: Record<string, Form> = {}

export const assessmentSubmissionHandler = ({
	origin,
	formStorage,
	submissionStorage,
}: {
	origin: URL
	formStorage: Store<Form>
	submissionStorage: Store<Submission>
}): ((request: Request, response: Response) => Promise<void>) => {
	const input = Type.Object(
		{
			$schema: Type.String({
				pattern: `^${new URL(
					'./form/',
					origin,
				).toString()}[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$`,
			}),
			response: Type.Object({}),
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

		// Extract formId from $schema
		const formId = formIdRegEx.exec(validBody.value.$schema)?.groups
			?.id as string

		// Load form
		const form = formCache[formId] ?? (await formStorage.get(formId))
		if (form === undefined)
			return respondWithProblem(response, {
				title: `Invalid assessment.`,
				status: HTTPStatusCode.NotFound,
			})

		// Make sure response is for the given form
		if (form.$id !== validBody.value.$schema) {
			return respondWithProblem(response, {
				title: `Response form ${validBody.value.$schema} does not match form ID ${form.$id}.`,
				status: HTTPStatusCode.BadRequest,
			})
		}

		// Validate response against form
		// FIXME: implement
		/*
		const validResponse = validateResponse(validBody.value.response)
		if ('errors' in validResponse) {
			console.error(validResponse)
			return respondWithProblem(
				response,
				errorsToProblemDetail(validResponse.errors),
			)
		}
		*/

		const id = ulid()
		await submissionStorage.persist(id, validBody.value.response as Submission) // FIXME: remove "as Submission"
		response
			.status(HTTPStatusCode.Created)
			.header('Location', new URL(`./submission/${id}`, origin).toString())
			.end()
	}
}
