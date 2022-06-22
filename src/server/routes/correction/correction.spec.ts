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
import { Store } from '../../../storage/store.js'
import { portForTest } from '../../../test/portForTest.js'
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
const forms: Record<string, any> = {
	[formId]: simpleForm,
}
const dummyFormStorage: Store<Form> = {
	persist: async (id, form) => {
		forms[id] = form
	},
	get: async (id) =>
		forms[id] !== undefined ? { id, data: forms[id] } : undefined,
	findAll: async () => [],
}

const submissions: Record<string, Static<typeof Submission>> = {}
const submissionId = ulid()
const submission: Static<typeof Submission> = {
	form: new URL(`./form/${formId}`, endpoint).toString(),
	response: {
		section1: {
			question1: 'Answer',
		},
	},
}
submissions[submissionId] = submission
const dummySubmissionStorage: Store<Static<typeof Submission>> = {
	persist: async (id, form) => {
		submissions[id] = form
	},
	get: async (id) =>
		submissions[id] !== undefined ? { id, data: submissions[id] } : undefined,
	findAll: async () => [],
}

const corrections: Record<string, Static<typeof Correction>> = {}
const dummyCorrectionStorage: Store<Static<typeof Correction>> = {
	persist: async (id, form) => {
		corrections[id] = form
	},
	get: async (id) =>
		corrections[id] !== undefined ? { id, data: corrections[id] } : undefined,
	findAll: async () => [],
}

const omnibus = new EventEmitter()

describe('Correction API', () => {
	let app: Express
	let httpServer: Server
	let r: SuperTest<Test>

	const adminEmail = `some-admin${ulid()}@example.com`
	const getExpressCookie = getAuthCookie(1800, [adminEmail])

	beforeAll(async () => {
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
				formStorage: dummyFormStorage,
				submissionStorage: dummySubmissionStorage,
				correctionStorage: dummyCorrectionStorage,
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
		})
	})
})
