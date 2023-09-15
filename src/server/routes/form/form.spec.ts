import bodyParser from 'body-parser'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import request, { SuperTest, Test } from 'supertest'
import { URL } from 'url'
import { Form } from '../../../form/form.js'
import { formSchema } from '../../../schema/form.js'
import { portForTest } from '../../../test/portForTest.js'
import { tempJsonFileStore } from '../../../test/tempJsonFileStore.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { formCreationHandler } from './create.js'
import { formGetHandler } from './get.js'

const port = portForTest(__filename)

const endpoint = new URL(`http://127.0.0.1:${port}`)

const schema = formSchema({
	$id: new URL(`./schema/0.0.0-development/form#`, endpoint),
})

describe('Form API', () => {
	let app: Express
	let httpServer: Server
	let r: SuperTest<Test>
	const cleanups: (() => Promise<void>)[] = []

	beforeAll(async () => {
		const { cleanup: cleanupFormStorage, store: formStorage } =
			await tempJsonFileStore<Form>()
		cleanups.push(cleanupFormStorage)

		app = express()
		app.use(bodyParser.json({ strict: true, limit: '250kb' }))
		app.get('/form/:id', formGetHandler({ storage: formStorage }))
		app.post(
			'/form',
			formCreationHandler({
				endpoint,
				storage: formStorage,
				schema,
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

	const simpleForm = {
		$schema: schema.$id,
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

		it('should overwrite the $id parameter if present', async () => {
			const createResponse = await r
				.post('/form')
				.send({
					$id: 'https://example.com/form/simpleForm',
					...simpleForm,
				})
				.expect(HTTPStatusCode.Created)
				.expect(
					'Location',
					new RegExp(
						`^http://127.0.0.1:${port}/form/[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$`,
					),
				)
			const createdForm = new URL(createResponse.headers.location)
			const response = await r
				.get(`${createdForm.pathname}`)
				.expect(HTTPStatusCode.OK)
				.expect('Content-Type', /application\/json/)
			expect(response.body.$id).toEqual(createdForm.toString())
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
