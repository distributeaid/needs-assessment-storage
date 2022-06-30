import { Static, Type } from '@sinclair/typebox'
import { Request, Response } from 'express'
import { URL } from 'url'
import { AuthContext } from '../../../authenticateRequest.js'
import { Correction } from '../../../form/correction.js'
import { Form } from '../../../form/form.js'
import { responsesToTSV } from '../../../form/responsesToTSV.js'
import { Submission } from '../../../form/submission.js'
import { errorsToProblemDetail } from '../../../input-validation/errorsToProblemDetail.js'
import { validateWithTypebox } from '../../../input-validation/validateWithTypebox.js'
import { Store } from '../../../storage/store.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { respondWithProblem } from '../../response/problem.js'

const formCache: Record<string, Form> = {}

export const assessmentsExportHandler = ({
	endpoint,
	formStorage,
	submissionStorage,
	correctionStorage,
}: {
	endpoint: URL
	formStorage: Store<Form>
	submissionStorage: Store<Static<typeof Submission>>
	correctionStorage: Store<Static<typeof Correction>>
}): ((request: Request, response: Response) => Promise<void>) => {
	const input = Type.Object(
		{
			form: Type.String({
				format: 'uri',
			}),
		},
		{ additionalProperties: false },
	)

	const validate = validateWithTypebox(input)

	const formIdRegEx = new RegExp(
		`^${new URL(
			'./form/',
			endpoint,
		).toString()}(?<id>[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$)`,
	)

	return async (request, response) => {
		const authContext = request.user as AuthContext
		if (!authContext.isAdmin)
			return respondWithProblem(request, response, {
				status: HTTPStatusCode.Forbidden,
				title: `Access denied for ${authContext.email}.`,
			})

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

		const submissions = await submissionStorage.findAll({
			form: validBody.value.form,
		})

		const corrections: Record<
			string,
			{ id: string; data: Static<typeof Correction> }[]
		> = {}
		await Promise.all(
			submissions.map(async ({ id }) => {
				corrections[id] = await correctionStorage.findAll({
					submission: new URL(`./assessment/${id}`, endpoint).toString(),
				})
			}),
		)

		response
			.status(HTTPStatusCode.OK)
			.header('Content-Type', 'text/tsv; charset=utf-8')
			.send(
				responsesToTSV(
					form,
					submissions.map(({ id, data: { response } }) => ({
						id,
						response,
						corrections: corrections[id],
					})),
				),
			)
			.end()
	}
}
