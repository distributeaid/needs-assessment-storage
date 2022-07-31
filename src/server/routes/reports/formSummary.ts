import { Static } from '@sinclair/typebox'
import { Request, Response } from 'express'
import { URL } from 'url'
import { Correction } from '../../../form/correction.js'
import { Form } from '../../../form/form.js'
import { Submission } from '../../../form/submission.js'
import { summarizeResponses } from '../../../reports/summarizeResponses.js'
import { Store } from '../../../storage/store.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { respondWithProblem } from '../../response/problem.js'

const formCache: Record<string, Form> = {}

export const formSummaryHandler =
	({
		endpoint,
		formStorage,
		submissionStorage,
		correctionStorage,
	}: {
		endpoint: URL
		formStorage: Store<Form>
		submissionStorage: Store<Static<typeof Submission>>
		correctionStorage: Store<Static<typeof Correction>>
	}): ((request: Request, response: Response) => Promise<void>) =>
	async (request, response) => {
		const formId = request.params.id

		// Load form
		const form = formCache[formId] ?? (await formStorage.get(formId))?.data
		if (form === undefined)
			return respondWithProblem(request, response, {
				title: `Invalid form.`,
				status: HTTPStatusCode.NotFound,
			})
		formCache[formId] = form

		const $formId = new URL(`./form/${formId}`, endpoint)

		// Load submissions and corrections
		const submissions = await submissionStorage.findAll({
			form: $formId.toString(),
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
			.header('Content-Type', 'text/json; charset=utf-8')
			.send(
				summarizeResponses(
					form,
					submissions.map((submission) => ({
						id: submission.id,
						response: submission.data.response,
						corrections: corrections[submission.id],
					})),
				),
			)
			.end()
	}
