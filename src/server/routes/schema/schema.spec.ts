import bodyParser from 'body-parser'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import request, { SuperTest, Test } from 'supertest'
import { formSchema } from '../../../schema/form.js'
import { portForTest } from '../../../test/portForTest.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { schemaHandler } from './schema.js'

const port = portForTest(__filename)

describe('Schema API', () => {
	let app: Express
	let httpServer: Server
	let r: SuperTest<Test>

	beforeAll(async () => {
		app = express()
		app.use(bodyParser.json({ strict: true }))
		app.get(
			'/schema/0.0.0-development/form',
			schemaHandler(
				formSchema({
					$id: new URL(
						`http://127.0.0.1:${port}/schema/0.0.0-development/form#`,
					),
				}),
			),
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
	test('/schema/0.0.0-development/form', async () => {
		const res = await r
			.get('/schema/0.0.0-development/form')
			.expect(HTTPStatusCode.OK)
			.expect('Content-Type', /application\/schema\+json/)

		expect(res.body).toEqual(
			formSchema({
				$id: new URL(`http://127.0.0.1:${port}/schema/0.0.0-development/form#`),
			}),
		)
		const schema = res.body
		expect(schema.$id).toEqual(
			`http://127.0.0.1:${port}/schema/0.0.0-development/form#`,
		)
	})
})
