import { Static } from '@sinclair/typebox'
import { Request, Response } from 'express'
import { URL } from 'url'
import { getCountryByCountryCode } from '../../../country/getCountryByCountryCode.js'
import { Correction } from '../../../form/correction.js'
import { Form, RegionQuestionFormat } from '../../../form/form.js'
import { Submission } from '../../../form/submission.js'
import {
	Grouping,
	summarizeResponses,
} from '../../../reports/summarizeResponses.js'
import { Store } from '../../../storage/store.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { respondWithProblem } from '../../response/problem.js'

type Filter = {
	sectionId: string
	questionId: string
	eq: (v: string | string[] | [number, string]) => boolean
}[]

const loadSubmissions = async ({
	submissionStorage,
	correctionStorage,
	$formId,
	endpoint,
	filter,
}: {
	submissionStorage: Store<Static<typeof Submission>>
	correctionStorage: Store<Static<typeof Correction>>
	$formId: URL
	endpoint: URL
	filter: Filter
}) => {
	// Load submissions and corrections
	const submissions = (
		await submissionStorage.findAll({
			form: $formId.toString(),
		})
	)
		// and optionally filter
		.filter((submission) => {
			for (const { sectionId, questionId, eq } of filter) {
				if (!eq(submission.data.response[sectionId]?.[questionId])) return false
			}
			return true
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
	return { submissions, corrections }
}

const formCache: Record<string, Form> = {}

export const summaryHandler =
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
		let form: Form | undefined = undefined
		try {
			form = formCache[formId] ?? (await formStorage.get(formId))?.data
		} catch (error) {
			console.error(`Failed to get form`, formId, error)
		}
		if (form === undefined)
			return respondWithProblem(request, response, {
				title: `Invalid form.`,
				status: HTTPStatusCode.NotFound,
			})
		formCache[formId] = form

		const $formId = new URL(`./form/${formId}`, endpoint)

		// Option: filter submissions
		const filter: Filter = []

		for (const [key, value] of Object.entries(request.query)
			// Allow cache busting
			.filter(([k]) => k !== 'ts')
			// Allow grouping
			.filter(([k]) => k !== 'groupBy')) {
			const [sectionId, questionId] = key.split('.')
			const section = form.sections.find(({ id }) => id === sectionId)
			if (section === undefined) {
				return respondWithProblem(request, response, {
					title: `Unknown section "${sectionId}" used in filter.`,
					status: HTTPStatusCode.BadRequest,
				})
			}
			const question = section.questions.find(({ id }) => id === questionId)
			if (question === undefined) {
				return respondWithProblem(request, response, {
					title: `Unknown question "${sectionId}.${questionId}" used in filter.`,
					status: HTTPStatusCode.BadRequest,
				})
			}
			// Values can specify a property to match against
			if ((value as string).includes(':')) {
				const [property, countryCode] = (value as string).split(':')
				// Validate property
				if (question.format.type === 'region' && property === 'countryCode') {
					filter.push({
						sectionId,
						questionId,
						eq: (v) => {
							// Find region of answer
							const region = (
								question.format as RegionQuestionFormat
							).regions.find(({ id }) => id === v)
							if (region === undefined) return false
							// Load country for the region
							let country
							try {
								country = getCountryByCountryCode(region.countryCode)
							} catch {
								// pass
							}
							// Make sure the region's country matches the country code defined in the filter
							return country?.countryCode === countryCode
						},
					})
				} else {
					return respondWithProblem(request, response, {
						title: `Question format "${question.format.type}" does not support property "${property}".`,
						status: HTTPStatusCode.BadRequest,
					})
				}
			} else {
				filter.push({
					sectionId,
					questionId,
					eq: (v) => v === value,
				})
			}
		}

		// Option: group submissions
		const groupBy: Grouping[] = []
		if (request.query.groupBy !== undefined) {
			if (typeof request.query.groupBy === 'string') {
				for (const sectionQuestionId of request.query.groupBy.split(',')) {
					const [sectionId, questionId] = sectionQuestionId.split('.')
					if (sectionId === undefined || questionId === undefined)
						return respondWithProblem(request, response, {
							title: `Must provide section ID and question ID separated by a dot, got "${sectionQuestionId}".`,
							status: HTTPStatusCode.BadRequest,
						})
					const q = form.sections
						.find(({ id }) => id === sectionId)
						?.questions.find(({ id }) => id === questionId)
					if (q === undefined)
						return respondWithProblem(request, response, {
							title: `Unknown question id "${sectionQuestionId}" used in groupBy.`,
							status: HTTPStatusCode.BadRequest,
						})
					groupBy.push([sectionId, questionId])
				}
			}
		}

		const { submissions, corrections } = await loadSubmissions({
			submissionStorage,
			correctionStorage,
			$formId,
			endpoint,
			filter,
		})

		// Build top-level summary
		response
			.status(HTTPStatusCode.OK)
			.header('Content-Type', 'text/json; charset=utf-8')
			.header('Access-Control-Allow-Origin', '*')
			.send(
				summarizeResponses(
					form,
					submissions.map((submission) => ({
						id: submission.id,
						response: submission.data.response,
						corrections: corrections[submission.id],
					})),
					groupBy,
				),
			)
			.end()
	}
