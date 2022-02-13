import { Static } from '@sinclair/typebox'
import { json } from 'body-parser'
import EventEmitter from 'events'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import request, { SuperTest, Test } from 'supertest'
import { Form } from '../../../form/form'
import { Submission } from '../../../form/submission'
import { form } from '../../../schema/form'
import { Store } from '../../../storage/store'
import { portForTest } from '../../../test/portForTest'
import { ulid } from '../../../ulid'
import { HTTPStatusCode } from '../../response/HttpStatusCode'
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
					required: true,
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

const submissions: Record<string, Static<typeof Submission>> = {}
const dummySubmissionStorage: Store<Static<typeof Submission>> = {
	persist: async (id, form) => {
		submissions[id] = form
	},
	get: async (id) => submissions[id],
}

const omnibus = new EventEmitter()

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
				omnibus,
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
					form: new URL(`./form/${formId}`, origin),
					response: {
						section1: {
							question1: 'Answer',
						},
					},
				})
				.expect(HTTPStatusCode.Created)
				.expect(
					'Location',
					new RegExp(
						`^http://127.0.0.1:${port}/submission/[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$`,
					),
				))

		it('should fail with unknown form', async () =>
			r
				.post(`/assessment`)
				.send({
					form: new URL(`./form/${ulid()}`, origin),
					response: {},
				})
				.expect(HTTPStatusCode.NotFound)
				.expect('Content-Type', /application\/problem\+json/))

		it('should fail with invalid submission', async () =>
			r
				.post(`/assessment`)
				.send({
					form: new URL(`./form/${formId}`, origin),
					response: {
						section1: {
							question1: '', // Min-length = 1
						},
					},
				})
				.expect(HTTPStatusCode.BadRequest)
				.expect('Content-Type', /application\/problem\+json/))
	})
})
