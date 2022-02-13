import { json } from 'body-parser'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import request, { SuperTest, Test } from 'supertest'
import { URL } from 'url'
import { Form } from '../../../form/form'
import { form } from '../../../schema/form'
import { Store } from '../../../storage/store'
import { portForTest } from '../../../test/portForTest'
import { HTTPStatusCode } from '../../response/HttpStatusCode'
import { formCreationHandler } from './create'
import { formGetHandler } from './get'

const port = portForTest(__filename)

const forms: Record<string, Form> = {}

const dummyStorage: Store<Form> = {
	persist: async (id, form) => {
		forms[id] = form
	},
	get: async (id) => forms[id],
}

const origin = new URL(`http://127.0.0.1:${port}`)

describe('Form API', () => {
	let app: Express
	let httpServer: Server
	let r: SuperTest<Test>

	beforeAll(async () => {
		app = express()
		app.use(json())
		app.get('/form/:id', formGetHandler({ storage: dummyStorage }))
		app.post(
			'/form',
			formCreationHandler({
				origin,
				storage: dummyStorage,
				version: '0.0.0-development',
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

	const formSchema = form({
		baseURL: new URL('./schema/', new URL(`http://127.0.0.1:${port}`)),
		version: '0.0.0-development',
	})
	const simpleForm = {
		$schema: formSchema.$id,
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
	} as const
	let createdForm: URL
	describe('POST /form', () => {
		it('should fail with invalid form', async () =>
			r
				.post('/form')
				.send({})
				.expect(HTTPStatusCode.BadRequest)
				.expect('Content-Type', /application\/problem\+json/))

		it('should persist a valid form', async () => {
			const response = await r
				.post('/form')
				.send(simpleForm)
				.expect(HTTPStatusCode.Created)
				.expect(
					'Location',
					new RegExp(
						`^http://127.0.0.1:${port}/form/[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$`,
					),
				)
			createdForm = new URL(response.headers.location)
		})
	})

	describe('GET /form/:id', () => {
		it('should handle missing forms', async () =>
			r.get('/form/01FVJT6QD5HAXK82KFNGVFVRDZ').expect(HTTPStatusCode.NotFound))
		it('should return existing forms', async () => {
			const response = await r
				.get(`${createdForm.pathname}`)
				.expect(HTTPStatusCode.OK)
				.expect('Content-Type', /application\/json/)
			expect(response.body).toMatchObject(simpleForm)
			expect(response.body.$id).toEqual(createdForm.toString())
		})
	})
})
