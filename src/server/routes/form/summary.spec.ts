import { Static } from '@sinclair/typebox'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import request, { SuperTest, Test } from 'supertest'
import { Correction } from '../../../form/correction.js'
import {
	regionQuestion,
	timeOfYearSection,
} from '../../../form/example.form.js'
import { Form } from '../../../form/form.js'
import { Submission } from '../../../form/submission.js'
import { formSchema } from '../../../schema/form.js'
import { portForTest } from '../../../test/portForTest.js'
import { tempJsonFileStore } from '../../../test/tempJsonFileStore.js'
import { ulid } from '../../../ulid.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { summaryHandler } from './summary.js'

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
			id: 'basicInfo',
			title: 'Basic Info',
			questions: [regionQuestion],
		},
		timeOfYearSection,
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
				basicInfo: {
					region: 'samos',
				},
				foodItems: {
					rice: [2, 'epal'],
					cannedTomatoes: [100, 'cans'],
				},
				hygieneItems: {
					washingDetergent: [10, 'bottle1l'],
				},
				timeOfYear: {
					quarter: 'q1',
				},
			},
		})
		await submissionStorage.persist(ulid(), {
			form: $formId.toString(),
			response: {
				basicInfo: {
					region: 'lesvos',
				},
				foodItems: {
					rice: [200, 'kg'],
					cannedTomatoes: [3, 'epal'],
				},
				hygieneItems: {
					washingDetergent: [10, 'bag5k'],
				},
				timeOfYear: {
					quarter: 'q2',
				},
			},
		})
		await submissionStorage.persist(ulid(), {
			form: $formId.toString(),
			response: {
				basicInfo: {
					region: 'calais',
				},
				foodItems: {
					rice: [123, 'kg'],
					cannedTomatoes: [4, 'epal'],
				},
				hygieneItems: {
					washingDetergent: [17, 'bag5k'],
				},
				timeOfYear: {
					quarter: 'q2',
				},
			},
		})

		const { cleanup: cleanupCorrectionStorage, store: correctionStorage } =
			await tempJsonFileStore<Static<typeof Correction>>()
		cleanups.push(cleanupCorrectionStorage)

		app = express()
		app.get(
			'/form/:id/summary',
			summaryHandler({
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
		test('a summary for a form can be generated', async () => {
			const res = await r
				.get(`/form/${formId}/summary`)
				.set('Content-type', 'application/json; charset=utf-8')
				.expect(HTTPStatusCode.OK)
				.expect('Content-Type', /text\/json; charset=utf-8/)
			expect(JSON.parse(res.text)).toMatchObject({
				summary: {
					foodItems: {
						rice: { kg: 2 * 760 + 200 + 123 },
						cannedTomatoes: { cans: 100 + 3 * 384 + 4 * 384 },
					},
					hygieneItems: {
						washingDetergent: {
							washCycles: 10 * 38 + 10 * 90 + 17 * 90,
						},
					},
				},
				stats: {
					count: 3,
				},
			})
		})

		describe('summaries can be filtered', () => {
			describe('by any question response', () => {
				test('a specific region', async () => {
					const props = new URLSearchParams()
					props.set('basicInfo.region', 'lesvos')
					const res = await r
						.get(`/form/${formId}/summary?${props.toString()}`)
						.set('Content-type', 'application/json; charset=utf-8')
						.expect(HTTPStatusCode.OK)
						.expect('Content-Type', /text\/json; charset=utf-8/)
					expect(JSON.parse(res.text)).toMatchObject({
						summary: {
							foodItems: {
								rice: { kg: 200 },
								cannedTomatoes: { cans: 3 * 384 },
							},
							hygieneItems: {
								washingDetergent: {
									washCycles: 10 * 90,
								},
							},
						},
						stats: {
							count: 1,
						},
					})
				})

				test('a specific quarter', async () => {
					const props = new URLSearchParams()
					props.set('timeOfYear.quarter', 'q2')
					const res = await r
						.get(`/form/${formId}/summary?${props.toString()}`)
						.set('Content-type', 'application/json; charset=utf-8')
						.expect(HTTPStatusCode.OK)
						.expect('Content-Type', /text\/json; charset=utf-8/)
					expect(JSON.parse(res.text)).toMatchObject({
						summary: {
							foodItems: {
								rice: { kg: 200 + 123 },
								cannedTomatoes: { cans: 3 * 384 + 4 * 384 },
							},
							hygieneItems: {
								washingDetergent: {
									washCycles: 10 * 90 + 17 * 90,
								},
							},
						},
						stats: {
							count: 2,
						},
					})
				})
			})

			it("can be filtered by a region question's country", async () => {
				const props = new URLSearchParams()
				props.set('basicInfo.region', 'countryCode:GR')
				const res = await r
					.get(`/form/${formId}/summary?${props.toString()}`)
					.set('Content-type', 'application/json; charset=utf-8')
					.expect(HTTPStatusCode.OK)
					.expect('Content-Type', /text\/json; charset=utf-8/)
				expect(JSON.parse(res.text)).toMatchObject({
					summary: {
						foodItems: {
							rice: { kg: 2 * 760 + 200 },
							cannedTomatoes: { cans: 100 + 3 * 384 },
						},
						hygieneItems: {
							washingDetergent: {
								washCycles: 10 * 38 + 10 * 90,
							},
						},
					},
					stats: {
						count: 2,
					},
				})
			})

			it('can combine filters', async () => {
				const props = new URLSearchParams()
				props.set('basicInfo.region', 'countryCode:GR')
				props.set('timeOfYear.quarter', 'q2')
				const res = await r
					.get(`/form/${formId}/summary?${props.toString()}`)
					.set('Content-type', 'application/json; charset=utf-8')
					.expect(HTTPStatusCode.OK)
					.expect('Content-Type', /text\/json; charset=utf-8/)
				expect(JSON.parse(res.text)).toMatchObject({
					summary: {
						foodItems: {
							rice: { kg: 200 },
							cannedTomatoes: { cans: 3 * 384 },
						},
						hygieneItems: {
							washingDetergent: {
								washCycles: 10 * 90,
							},
						},
					},
					stats: { count: 1 },
				})
			})

			it.each(['basicInfo=bar', 'foo.bar=42', 'basicInfo.region=code:AA'])(
				'should reject invalid filters (%s)',
				async (query) =>
					r
						.get(
							`/form/${formId}/summary?${new URLSearchParams(
								query as any,
							).toString()}`,
						)
						.set('Content-type', 'application/json; charset=utf-8')
						.expect(HTTPStatusCode.BadRequest),
			)
		})

		describe('summaries can be grouped', () => {
			test('group a summary', async () => {
				const props = new URLSearchParams()
				props.set('groupBy', 'timeOfYear.quarter,basicInfo.region')
				const res = await r
					.get(`/form/${formId}/summary?${props.toString()}`)
					.set('Content-type', 'application/json; charset=utf-8')
					.expect(HTTPStatusCode.OK)
					.expect('Content-Type', /text\/json; charset=utf-8/)
				expect(JSON.parse(res.text)).toMatchObject({
					summary: {
						q1: {
							samos: {
								foodItems: {
									rice: { kg: 2 * 760 },
									cannedTomatoes: { cans: 100 },
								},
								hygieneItems: {
									washingDetergent: {
										washCycles: 10 * 38,
									},
								},
							},
						},
						q2: {
							lesvos: {
								foodItems: {
									rice: { kg: 200 },
									cannedTomatoes: { cans: 3 * 384 },
								},
								hygieneItems: {
									washingDetergent: {
										washCycles: 10 * 90,
									},
								},
							},
							calais: {
								foodItems: {
									rice: { kg: 123 },
									cannedTomatoes: { cans: 4 * 384 },
								},
								hygieneItems: {
									washingDetergent: {
										washCycles: 17 * 90,
									},
								},
							},
						},
					},
					stats: {
						count: 3,
					},
				})
			})

			test('invalid group format', async () => {
				const props = new URLSearchParams()
				props.set('groupBy', 'foo')
				await r
					.get(`/form/${formId}/summary?${props.toString()}`)
					.expect(HTTPStatusCode.BadRequest)
					.expect('Content-Type', /application\/problem\+json/)
					.expect(
						/Must provide section ID and question ID separated by a dot, got \\"foo\\"./,
					)
			})

			test('unknown groups', async () => {
				const props = new URLSearchParams()
				props.set('groupBy', 'foo.bar')
				await r
					.get(`/form/${formId}/summary?${props.toString()}`)
					.expect(HTTPStatusCode.BadRequest)
					.expect('Content-Type', /application\/problem\+json/)
					.expect(/Unknown question id \\"foo.bar\\" used in groupBy./)
			})
		})
	})
})
