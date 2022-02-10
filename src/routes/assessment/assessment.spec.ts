import { json } from 'body-parser'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import request, { SuperTest, Test } from 'supertest'
import { HTTPStatusCode } from '../../server/response/HttpStatusCode'
import { assessmentSubmissionHandler } from './submit'

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
				origin: new URL('http://127.0.0.1:8887/'),
			}),
		)
		httpServer = createServer(app)
		await new Promise<void>((resolve) =>
			httpServer.listen(8887, '127.0.0.1', undefined, resolve),
		)
		r = request('http://127.0.0.1:8887')
	})
	afterAll(async () => {
		httpServer.close()
	})
	describe('POST /assessment', () => {
		it('should fail with invalid submission', async () => {
			await r
				.post('/assessment')
				.send({})
				.expect(HTTPStatusCode.BadRequest)
				.expect('Content-Type', /application\/problem\+json/)
		})
	})
})
