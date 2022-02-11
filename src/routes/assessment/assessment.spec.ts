import { json } from 'body-parser'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import request, { SuperTest, Test } from 'supertest'
import { Form } from '../../form/form'
import { Submission } from '../../form/submission'
import { form } from '../../schema/form'
import { HTTPStatusCode } from '../../server/response/HttpStatusCode'
import { Store } from '../../storage/store'
import { portForTest } from '../../test/portForTest'
import { ulid } from '../../ulid'
import { assessmentSubmissionHandler } from './submit'

const port = portForTest(__filename)

const origin = new URL(`http://127.0.0.1:${port}`)

const formId = ulid()
const formSchema = form({
	baseURL: new URL('./schema/', origin),
	version: '0.0.0-development',
})
const simpleForm: Form = {
	$schema: formSchema.$id,
	$id: new URL(`./form/${formId}`, origin).toString(),
	sections: [
		{
			id: 'section1',
			title: 'Section 1',
			questions: [
				{
					id: 'question1',
					title: 'Question 1',
					format: {
						type: 'text',
					},
				},
			],
		},
	],
}
const forms: Record<string, any> = {
	[formId]: simpleForm,
}
const dummyFormStorage: Store<Form> = {
	persist: async (id, form) => {
		forms[id] = form
	},
	get: async (id) => forms[id],
}

const submissions: Record<string, Submission> = {}
const dummySubmissionStorage: Store<Submission> = {
	persist: async (id, form) => {
		submissions[id] = form
	},
	get: async (id) => submissions[id],
}

describe('Assessment API', () => {
	let app: Express
	let httpServer: Server
	let r: SuperTest<Test>

	beforeAll(async () => {
		app = express()
		app.use(json())
		app.post(
			'/assessment',
			assessmentSubmissionHandler({
				origin,
				formStorage: dummyFormStorage,
				submissionStorage: dummySubmissionStorage,
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
	})
	describe('POST /assessment', () => {
		it('should store a valid submission', async () =>
			r
				.post(`/assessment`)
				.send({
					$schema: new URL(`./form/${formId}`, origin),
					response: {},
				})
				.expect(HTTPStatusCode.Created))

		it('should fail with unknown form', async () =>
			r
				.post(`/assessment`)
				.send({
					$schema: new URL(`./form/${ulid()}`, origin),
					response: {},
				})
				.expect(HTTPStatusCode.NotFound)
				.expect('Content-Type', /application\/problem\+json/))

		it('should fail with invalid submission', async () =>
			r
				.post(`/assessment`)
				.send({})
				.expect(HTTPStatusCode.BadRequest)
				.expect('Content-Type', /application\/problem\+json/))
	})
})
