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
import { assessmentGetHandler } from '../assessment/assessmentGetHandler.js'
import { assessmentsExportHandler } from '../assessment/export.js'
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
			'/assessment/export',
			cookieAuth,
			assessmentsExportHandler({
				endpoint,
				formStorage,
				submissionStorage,
				correctionStorage,
			}),
		)
		app.get(
			'/assessment/:id',
			cookieAuth,
			assessmentGetHandler({
				endpoint,
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

	let correctionId1: string
	let correctionId2: string

	describe('should allow admins to provide corrections to responses', () => {
		// Register an admin
		let adminAuthCookie: string
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
			adminAuthCookie = tokenCookieRx.exec(
				res.header['set-cookie'],
			)?.[1] as string
		})

		// Register a user
		const userEmail = `some-user${ulid()}@example.com`
		let userAuthCookie: string
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
			userAuthCookie = tokenCookieRx.exec(
				res.header['set-cookie'],
			)?.[1] as string
		})

		describe('GET /assessment/:id', () => {
			it('should allow admins to retrieve submission in order to provide corrections', async () => {
				const res = await r
					.get(`/assessment/${submissionId}`)
					.set('Cookie', [`${authCookieName}=${adminAuthCookie}`])
					.set('Accept', 'application/json; charset=utf-8')
					.expect(HTTPStatusCode.OK)
					.expect('etag', '1')
				expect(res.body).toMatchObject(submission)
			})
		})

		describe('POST /correction', () => {
			it('should store a correction', async () => {
				const res = await r
					.post('/correction')
					.set('Content-type', 'application/json; charset=utf-8')
					.set('Cookie', [`${authCookieName}=${adminAuthCookie}`])
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
					)
				correctionId1 = ulidRegEx.exec(res.headers['location'])?.[0] as string
			})

			it('should store another correction', async () => {
				const res = await r
					.post('/correction')
					.set('Content-type', 'application/json; charset=utf-8')
					.set('Cookie', [`${authCookieName}=${adminAuthCookie}`])
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
					)
				correctionId2 = ulidRegEx.exec(res.headers['location'])?.[0] as string
			})

			it.each([['1', '3', 'a']])(
				'should not store a correction on etag mismatch (%s)',
				async (etag) =>
					r
						.post('/correction')
						.set('Content-type', 'application/json; charset=utf-8')
						.set('Cookie', [`${authCookieName}=${adminAuthCookie}`])
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

			it('should not allow users to create a correction', async () =>
				r
					.post('/correction')
					.set('Content-type', 'application/json; charset=utf-8')
					.set('Cookie', [`${authCookieName}=${userAuthCookie}`])
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
					.expect(HTTPStatusCode.Forbidden))
		})

		describe('POST /assessment/export', () => {
			describe('export should include the corrections', () => {
				it('should export the submissions', async () => {
					const res = await r
						.post(`/assessment/export`)
						.set('Content-type', 'application/json; charset=utf-8')
						.set('Cookie', [`${authCookieName}=${adminAuthCookie}`])
						.send({
							form: new URL(`./form/${formId}`, endpoint),
						})
						.expect(HTTPStatusCode.OK)
						.expect('Content-Type', /text\/tsv; charset=utf-8/)
					expect(res.text.split('\n').map((l) => l.split('\t'))).toMatchObject([
						['#', 'section1.question1', '$meta.version', '$meta.corrections'],
						[
							'Assessment ID',
							'Section 1: Question 1',
							'Version',
							'Corrections',
						],
						[
							submissionId,
							'Corrected answer, again',
							'3',
							`${correctionId1} by ${adminEmail}, ${correctionId2} by ${adminEmail}`,
						],
					])
				})
			})
		})

		describe('GET /assessment/:id', () => {
			it('should allow admins to retrieve submission in order to provide corrections', async () => {
				const res = await r
					.get(`/assessment/${submissionId}`)
					.set('Cookie', [`${authCookieName}=${adminAuthCookie}`])
					.set('Accept', 'application/json; charset=utf-8')
					.expect(HTTPStatusCode.OK)
					.expect('etag', '3')
				const correctedSubmission: Static<typeof Submission> = {
					...submission,
					response: {
						...submission.response,
						section1: {
							question1: 'Corrected answer, again',
						},
					},
				}
				expect(res.body).toMatchObject(correctedSubmission)
			})
			it('should not allow users to retrieve a submission', async () =>
				r
					.get(`/assessment/${submissionId}`)
					.set('Accept', 'application/json; charset=utf-8')
					.set('Cookie', [`${authCookieName}=${userAuthCookie}`])
					.expect(HTTPStatusCode.Forbidden))
		})
	})
})
