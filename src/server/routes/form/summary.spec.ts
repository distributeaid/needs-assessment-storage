import { Static } from '@sinclair/typebox'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import request, { SuperTest, Test } from 'supertest'
import { Correction } from '../../../form/correction.js'
import { Form } from '../../../form/form.js'
import { Submission } from '../../../form/submission.js'
import { formSchema } from '../../../schema/form.js'
import { portForTest } from '../../../test/portForTest.js'
import { tempJsonFileStore } from '../../../test/tempJsonFileStore.js'
import { ulid } from '../../../ulid.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { formSummaryHandler } from '../reports/formSummary.js'

const port = portForTest(__filename)

const endpoint = new URL(`http://127.0.0.1:${port}`)

const formId = ulid()
const $formId = new URL(`./form/${formId}`, endpoint)
const schema = formSchema({
	$id: new URL(`http://127.0.0.1:${port}/schema/0.0.0-development/form#`),
})
const formWithConversions: Form = {
	$schema: schema.$id,
	$id: $formId.toString(),
	sections: [
		{
			id: 'foodItems',
			title: 'Food items',
			questions: [
				{
					id: 'rice',
					title: 'Rice',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
								baseUnit: {
									id: 'kg',
									title: 'Kilogram',
									conversionFactor: 760,
								},
							},
							{
								id: 'kg',
								title: 'Kilogram',
							},
						],
					},
				},
				{
					id: 'cannedTomatoes',
					title: 'Canned Tomatoes',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
								baseUnit: {
									id: 'cans',
									title: 'Cans (#10 kitchen size)',
									conversionFactor: 384,
								},
							},
							{
								id: 'cans',
								title: 'Cans (#10 kitchen size)',
							},
						],
					},
				},
			],
		},
		{
			id: 'hygieneItems',
			title: 'Hygiene items',
			questions: [
				{
					id: 'washingDetergent',
					title: 'Washing Detergent',
					format: {
						type: 'non-negative-integer',
						units: [
							// In this definition the two units are converted, however `wash cycles` is not selectable for the response
							{
								id: 'bottle1l',
								title: '1L bottle',
								baseUnit: {
									id: 'washCycles',
									title: 'wash cycles',
									conversionFactor: 38,
								},
							},
							{
								id: 'bag5k',
								title: '5k bag',
								baseUnit: {
									id: 'washCycles',
									title: 'wash cycles',
									conversionFactor: 90,
								},
							},
						],
					},
				},
			],
		},
	],
}

describe('Summary API', () => {
	let app: Express
	let httpServer: Server
	let r: SuperTest<Test>
	const cleanups: (() => Promise<void>)[] = []

	beforeAll(async () => {
		const { cleanup: cleanupFormStorage, store: formStorage } =
			await tempJsonFileStore<Form>()
		cleanups.push(cleanupFormStorage)
		await formStorage.persist(formId, formWithConversions)
		const { cleanup: cleanupSubmissionStorage, store: submissionStorage } =
			await tempJsonFileStore<Static<typeof Submission>>()
		cleanups.push(cleanupSubmissionStorage)
		await submissionStorage.persist(ulid(), {
			form: $formId.toString(),
			response: {
				foodItems: {
					rice: [2, 'epal'],
					cannedTomatoes: [100, 'cans'],
				},
				hygieneItems: {
					washingDetergent: [10, 'bottle1l'],
				},
			},
		})
		await submissionStorage.persist(ulid(), {
			form: $formId.toString(),
			response: {
				foodItems: {
					rice: [200, 'kg'],
					cannedTomatoes: [3, 'epal'],
				},
				hygieneItems: {
					washingDetergent: [10, 'bag5k'],
				},
			},
		})

		const { cleanup: cleanupCorrectionStorage, store: correctionStorage } =
			await tempJsonFileStore<Static<typeof Correction>>()
		cleanups.push(cleanupCorrectionStorage)

		app = express()
		app.get(
			'/form/:id/summary',
			formSummaryHandler({
				endpoint,
				formStorage: formStorage,
				submissionStorage,
				correctionStorage,
			}),
		)

		httpServer = createServer(app)
		await new Promise<void>((resolve) =>
			httpServer.listen(port, '127.0.0.1', undefined, resolve),
		)
		r = request(`http://127.0.0.1:${port}`)
	})
	afterAll(async () => {
		httpServer.close()
		await Promise.all(cleanups)
	})
	describe('GET /form/:id/summary', () => {
		describe('admins are allowed to export all assessments for a form', () => {
			it('should export the submissions', async () => {
				const res = await r
					.get(`/form/${formId}/summary`)
					.set('Content-type', 'application/json; charset=utf-8')
					.expect(HTTPStatusCode.OK)
					.expect('Content-Type', /text\/json; charset=utf-8/)
				expect(JSON.parse(res.text)).toMatchObject({
					foodItems: {
						rice: { kg: 2 * 760 + 200 },
						cannedTomatoes: { cans: 100 + 3 * 384 },
					},
					hygieneItems: {
						washingDetergent: {
							washCycles: 10 * 38 + 10 * 90,
						},
					},
				})
			})
		})
	})
})
