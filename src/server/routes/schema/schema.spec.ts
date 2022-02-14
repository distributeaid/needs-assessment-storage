import { json } from 'body-parser'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import request, { SuperTest, Test } from 'supertest'
import { form } from '../../../schema/form.js'
import { question } from '../../../schema/question.js'
import { section } from '../../../schema/section.js'
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
		app.use(json())
		app.get(
			'/schema/form.schema.json',
			schemaHandler(
				form({
					baseURL: new URL(`http://127.0.0.1:${port}/schema/`),
					version: '0.0.0-development',
				}),
			),
		)
		app.get(
			'/schema/section.schema.json',
			schemaHandler(
				section({
					baseURL: new URL(`http://127.0.0.1:${port}/schema/`),
					version: '0.0.0-development',
				}),
			),
		)
		app.get(
			'/schema/question.schema.json',
			schemaHandler(
				question({
					baseURL: new URL(`http://127.0.0.1:${port}/schema/`),
					version: '0.0.0-development',
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
	test('/schema/form.schema.json?version=0.0.0-development', async () => {
		const res = await r
			.get('/schema/form.schema.json')
			.expect(HTTPStatusCode.OK)
			.expect('Content-Type', /application\/schema\+json/)

		expect(res.body).toEqual(
			form({
				baseURL: new URL(`http://127.0.0.1:${port}/schema/`),
				version: '0.0.0-development',
			}),
		)
		const formSchema = res.body
		expect(formSchema.$id).toEqual(
			`http://127.0.0.1:${port}/schema/form.schema.json?version=0.0.0-development`,
		)
		expect(formSchema.properties.sections.items.$ref).toEqual(
			`http://127.0.0.1:${port}/schema/section.schema.json?version=0.0.0-development`,
		)
	})
	test('/schema/section.schema.json', async () => {
		const res = await r
			.get('/schema/section.schema.json')
			.expect(HTTPStatusCode.OK)
			.expect('Content-Type', /application\/schema\+json/)

		expect(res.body).toEqual(
			section({
				baseURL: new URL(`http://127.0.0.1:${port}/schema/`),
				version: '0.0.0-development',
			}),
		)
		const sectionSchema = res.body
		expect(sectionSchema.$id).toEqual(
			`http://127.0.0.1:${port}/schema/section.schema.json?version=0.0.0-development`,
		)
		expect(sectionSchema.properties.questions.items.$ref).toEqual(
			`http://127.0.0.1:${port}/schema/question.schema.json?version=0.0.0-development`,
		)
	})
	test('/schema/question.schema.json', async () => {
		const res = await r
			.get('/schema/question.schema.json')
			.expect(HTTPStatusCode.OK)
			.expect('Content-Type', /application\/schema\+json/)
		const questionSchema = res.body
		expect(res.body).toEqual(
			question({
				baseURL: new URL(`http://127.0.0.1:${port}/schema/`),
				version: '0.0.0-development',
			}),
		)
		expect(questionSchema.$id).toEqual(
			`http://127.0.0.1:${port}/schema/question.schema.json?version=0.0.0-development`,
		)
	})
})
