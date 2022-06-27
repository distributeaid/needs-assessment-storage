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
import { ulid } from '../../../ulid.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import login from '../login.js'
import registerUser from '../register.js'
import { assessmentCorrectionHandler } from './correct.js'

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

const submissionId = ulid()
const submission: Static<typeof Submission> = {
	form: new URL(`./form/${formId}`, endpoint).toString(),
	response: {
		section1: {
			question1: 'Answer',
		},
	},
}

const omnibus = new EventEmitter()

describe('Correction API', () => {
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
		await submissionStorage.persist(submissionId, submission)
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
			'/correction',
			cookieAuth,
			assessmentCorrectionHandler({
				omnibus,
				endpoint,
				formStorage,
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

	describe('POST /correction', () => {
		describe('admins are allow to provide corrections to responses', () => {
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

			it('should store a correction', async () =>
				r
					.post('/correction')
					.set('Content-type', 'application/json; charset=utf-8')
					.set('Cookie', [`${authCookieName}=${authCookie}`])
					.set('If-Match', '1')
					.send({
						form: new URL(`./form/${formId}`, endpoint),
						submission: new URL(`./assessment/${submissionId}`, endpoint),
						response: {
							section1: {
								question1: 'Corrected answer',
							},
						},
					})
					.expect(HTTPStatusCode.Created)
					.expect(
						'Location',
						new RegExp(
							`^http://127.0.0.1:${port}/correction/[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$`,
						),
					))

			it('should store another correction', async () =>
				r
					.post('/correction')
					.set('Content-type', 'application/json; charset=utf-8')
					.set('Cookie', [`${authCookieName}=${authCookie}`])
					.set('If-Match', '2')
					.send({
						form: new URL(`./form/${formId}`, endpoint),
						submission: new URL(`./assessment/${submissionId}`, endpoint),
						response: {
							section1: {
								question1: 'Corrected answer, again',
							},
						},
					})
					.expect(HTTPStatusCode.Created)
					.expect(
						'Location',
						new RegExp(
							`^http://127.0.0.1:${port}/correction/[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$`,
						),
					))

			it.each([['1', '3', 'a']])(
				'should not store a correction on etag mismatch (%s)',
				async (etag) =>
					r
						.post('/correction')
						.set('Content-type', 'application/json; charset=utf-8')
						.set('Cookie', [`${authCookieName}=${authCookie}`])
						.set('If-Match', etag)
						.send({
							form: new URL(`./form/${formId}`, endpoint),
							submission: new URL(`./assessment/${submissionId}`, endpoint),
							response: {
								section1: {
									question1: 'Corrected answer, again',
								},
							},
						})
						.expect(HTTPStatusCode.Conflict),
			)
		})
	})
})
