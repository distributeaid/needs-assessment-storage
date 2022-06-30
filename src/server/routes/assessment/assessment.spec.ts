import { Static } from '@sinclair/typebox'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import EventEmitter from 'events'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import passport from 'passport'
import request, { SuperTest, Test } from 'supertest'
import {
	authCookie as getAuthCookie,
	authCookieName,
	cookieAuthStrategy,
} from '../../../authenticateRequest.js'
import { Correction } from '../../../form/correction.js'
import { Form } from '../../../form/form.js'
import { Submission } from '../../../form/submission.js'
import { formSchema } from '../../../schema/form.js'
import { portForTest } from '../../../test/portForTest.js'
import { tempJsonFileStore } from '../../../test/tempJsonFileStore.js'
import { ulid, ulidRegEx } from '../../../ulid.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import login from '../login.js'
import registerUser from '../register.js'
import { assessmentsExportHandler } from './export.js'
import { assessmentSubmissionHandler } from './submit.js'

const port = portForTest(__filename)

const endpoint = new URL(`http://127.0.0.1:${port}`)

const tokenCookieRx = new RegExp(`${authCookieName}=([^;]+);`, 'i')

const formId = ulid()
const schema = formSchema({
	$id: new URL(`http://127.0.0.1:${port}/schema/0.0.0-development/form#`),
})
const simpleForm: Form = {
	$schema: schema.$id,
	$id: new URL(`./form/${formId}`, endpoint).toString(),
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

const omnibus = new EventEmitter()

describe('Assessment API', () => {
	let app: Express
	let httpServer: Server
	let r: SuperTest<Test>
	const cleanups: (() => Promise<void>)[] = []

	const adminEmail = `some-admin${ulid()}@example.com`
	const getExpressCookie = getAuthCookie(1800, [adminEmail])

	beforeAll(async () => {
		const { cleanup: cleanupFormStorage, store: formStorage } =
			await tempJsonFileStore<Form>()
		cleanups.push(cleanupFormStorage)
		await formStorage.persist(formId, simpleForm)
		const { cleanup: cleanupSubmissionStorage, store: submissionStorage } =
			await tempJsonFileStore<Static<typeof Submission>>()
		cleanups.push(cleanupSubmissionStorage)
		const { cleanup: cleanupCorrectionStorage, store: correctionStorage } =
			await tempJsonFileStore<Static<typeof Correction>>()
		cleanups.push(cleanupCorrectionStorage)

		app = express()
		app.use(cookieParser('cookie-secret'))
		app.use(bodyParser.json({ strict: true }))
		app.use(passport.initialize())
		const cookieAuth = passport.authenticate('cookie', { session: false })
		passport.use(cookieAuthStrategy)
		app.post(
			'/assessment',
			assessmentSubmissionHandler({
				omnibus,
				endpoint,
				formStorage,
				submissionStorage,
			}),
		)
		app.post(
			'/assessment/export',
			cookieAuth,
			assessmentsExportHandler({
				endpoint,
				formStorage: formStorage,
				submissionStorage,
				correctionStorage,
			}),
		)

		app.post(
			'/register',
			registerUser(omnibus, () => '123456'),
		)
		app.post('/login', login(getExpressCookie))
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
	let submissionId: string
	describe('POST /assessment', () => {
		it('should store a valid submission', async () => {
			const res = await r
				.post(`/assessment`)
				.send({
					form: new URL(`./form/${formId}`, endpoint),
					response: {
						section1: {
							question1: 'Answer',
						},
					},
				})
				.expect(HTTPStatusCode.Created)
				.expect('ETag', '1')
				.expect(
					'Location',
					new RegExp(
						`^http://127.0.0.1:${port}/assessment/[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$`,
					),
				)
			submissionId = ulidRegEx.exec(res.headers['location'])?.[0] as string
		})

		it('should fail with unknown form', async () =>
			r
				.post(`/assessment`)
				.send({
					form: new URL(`./form/${ulid()}`, endpoint),
					response: {},
				})
				.expect(HTTPStatusCode.NotFound)
				.expect('Content-Type', /application\/problem\+json/))

		it('should fail with invalid submission', async () =>
			r
				.post(`/assessment`)
				.send({
					form: new URL(`./form/${formId}`, endpoint),
					response: {
						section1: {
							question1: '', // Min-length = 1
						},
					},
				})
				.expect(HTTPStatusCode.BadRequest)
				.expect('Content-Type', /application\/problem\+json/))
	})
	describe('POST /assessment/export', () => {
		describe('admins are allowed to export all assessments for a form', () => {
			let authCookie: string
			// Login
			beforeAll(async () => {
				await r
					.post('/register')
					.set('Content-type', 'application/json; charset=utf-8')
					.send({
						email: adminEmail,
					})
					.expect(HTTPStatusCode.Accepted)
				const res = await r
					.post('/login')
					.send({
						email: adminEmail,
						token: '123456',
					})
					.expect(HTTPStatusCode.OK)
				authCookie = tokenCookieRx.exec(res.header['set-cookie'])?.[1] as string
			})

			it('should export the submissions', async () => {
				const res = await r
					.post(`/assessment/export`)
					.set('Content-type', 'application/json; charset=utf-8')
					.set('Cookie', [`${authCookieName}=${authCookie}`])
					.send({
						form: new URL(`./form/${formId}`, endpoint),
					})
					.expect(HTTPStatusCode.OK)
					.expect('Content-Type', /text\/tsv; charset=utf-8/)
				expect(res.text.split('\n').map((l) => l.split('\t'))).toMatchObject([
					['#', 'section1.question1', '$meta.version', '$meta.corrections'],
					['Assessment ID', 'Section 1: Question 1', 'Version', 'Corrections'],
					[submissionId, 'Answer', '1', ''],
				])
			})
		})

		describe('non-admins should not be allowed to export', () => {
			const userEmail = `some-user${ulid()}@example.com`
			let authCookie: string
			// Login
			beforeAll(async () => {
				await r
					.post('/register')
					.set('Content-type', 'application/json; charset=utf-8')
					.send({
						email: userEmail,
					})
					.expect(HTTPStatusCode.Accepted)
				const res = await r
					.post('/login')
					.send({
						email: userEmail,
						token: '123456',
					})
					.expect(HTTPStatusCode.OK)
				authCookie = tokenCookieRx.exec(res.header['set-cookie'])?.[1] as string
			})

			it('should not export the submissions', async () =>
				r
					.post(`/assessment/export`)
					.set('Content-type', 'application/json; charset=utf-8')
					.set('Cookie', [`${authCookieName}=${authCookie}`])
					.send({
						form: new URL(`./form/${formId}`, endpoint),
					})
					.expect(HTTPStatusCode.Forbidden))
		})
	})
})
