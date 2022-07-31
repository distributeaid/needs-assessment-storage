import { Static } from '@sinclair/typebox'
import bodyParser from 'body-parser'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import EventEmitter from 'events'
import express, { Express, NextFunction, Request, Response } from 'express'
import passport from 'passport'
import { URL } from 'url'
import { authCookie, cookieAuthStrategy } from '../../authenticateRequest.js'
import { Correction } from '../../form/correction.js'
import { exampleForm } from '../../form/example.form.js'
import { exampleResponse } from '../../form/example.response.js'
import { Form } from '../../form/form.js'
import { Submission } from '../../form/submission.js'
import { addVersion } from '../../input-validation/addVersion.js'
import { formSchema } from '../../schema/form.js'
import { Store } from '../../storage/store.js'
import { ulid } from '../../ulid.js'
import { addRequestId } from '../addRequestId.js'
import { HTTPStatusCode } from '../response/HttpStatusCode.js'
import { respondWithProblem } from '../response/problem.js'
import { assessmentGetHandler } from '../routes/assessment/assessmentGetHandler.js'
import { assessmentsExportHandler } from '../routes/assessment/export.js'
import { assessmentSubmissionHandler } from '../routes/assessment/submit.js'
import { deleteCookie, renewCookie } from '../routes/cookie.js'
import { assessmentCorrectionHandler } from '../routes/correction/correct.js'
import { formCreationHandler } from '../routes/form/create.js'
import { formGetHandler } from '../routes/form/get.js'
import login from '../routes/login.js'
import registerUser from '../routes/register.js'
import { formSummaryHandler } from '../routes/reports/formSummary.js'
import { schemaHandler } from '../routes/schema/schema.js'

export const backend = ({
	omnibus,
	cookieSecret,
	cookieLifetimeSeconds,
	origin,
	endpoint,
	version,
	generateToken,
	adminEmails,
	formStorage,
	submissionStorage,
	correctionStorage,
}: {
	omnibus: EventEmitter
	origin: URL
	endpoint: URL
	cookieSecret?: string
	cookieLifetimeSeconds?: number
	adminEmails: string[]
	version: string
	/**
	 * This functions is used to generate confirmation tokens send to users to validate their email addresses.
	 */
	generateToken?: () => string
	formStorage: Store<Form>
	submissionStorage: Store<Static<typeof Submission>>
	correctionStorage: Store<Static<typeof Correction>>
}): Express => {
	const app = express()
	/**
	 * @see ../docs/authentication.md
	 */
	if (cookieSecret === undefined) {
		console.warn(`⚠️ Cookie secret not set, using random value.`)
	}
	console.debug(
		`ℹ️ Cookie lifetime is ${cookieLifetimeSeconds ?? 1800} seconds`,
	)
	console.debug(`ℹ️ Admins:`)
	adminEmails.map((e) => console.log(` - ${e}`))
	const getAuthCookie = authCookie(cookieLifetimeSeconds ?? 1800, adminEmails)
	app.use(cookieParser(cookieSecret ?? ulid()))
	app.use(bodyParser.json({ strict: true }))
	app.use(
		(
			err: Error | undefined,
			req: Request,
			res: Response,
			next: NextFunction,
		) => {
			if (err !== undefined) {
				return respondWithProblem(req, res, {
					status: HTTPStatusCode.BadRequest,
					title: 'Invalid request data.',
				})
			} else {
				next()
			}
		},
	)
	app.use(passport.initialize())
	const cookieAuth = passport.authenticate('cookie', { session: false })
	passport.use(cookieAuthStrategy)

	app.use(
		cors({
			origin: `${origin.protocol}//${origin.host}`,
			credentials: true,
			exposedHeaders: ['Location', 'etag'],
		}),
	)

	app.use(addVersion(version))
	app.use(addRequestId)

	// Auth
	app.post('/register', registerUser(omnibus, generateToken))
	app.post('/login', login(getAuthCookie))
	app.get('/cookie', cookieAuth, renewCookie(getAuthCookie))
	app.delete('/cookie', cookieAuth, deleteCookie)

	// Schemas
	const schemaId = new URL(`./schema/${version}/form#`, endpoint)
	const schema = formSchema({
		$id: schemaId,
	})
	app.get(`/schema/${version}/form`, schemaHandler(schema))
	app.get(`/schema`, (_, response) =>
		response
			.status(HTTPStatusCode.Found)
			.header(
				'Location',
				new URL(`/schema/${version}/form#`, endpoint).toString(),
			)
			.end(),
	)

	// Forms
	app.post(
		'/form',
		formCreationHandler({ storage: formStorage, endpoint, schema }),
	)
	const exampleFormId = new URL(`./form/example`, endpoint)
	app.get('/form/example', (_, res) =>
		res
			.status(HTTPStatusCode.OK)
			.header('Content-Type', 'application/json; charset=utf-8')
			.send(
				JSON.stringify(
					exampleForm({
						$schema: schemaId,
						$id: exampleFormId,
					}),
					null,
					2,
				),
			)
			.end(),
	)
	app.get('/form/:id', formGetHandler({ storage: formStorage }))

	// Submissions
	app.post(
		'/assessment',
		assessmentSubmissionHandler({
			omnibus,
			endpoint,
			formStorage,
			submissionStorage,
		}),
	)
	app.get('/assessment/example', (_, res) =>
		res
			.status(HTTPStatusCode.OK)
			.header('Content-Type', 'application/json; charset=utf-8')
			.send(
				JSON.stringify(
					{ form: exampleFormId, response: exampleResponse },
					null,
					2,
				),
			)
			.end(),
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

	// Corrections
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

	// Reports
	app.get(
		'/form/:id/summary',
		formSummaryHandler({
			endpoint,
			formStorage,
			submissionStorage,
			correctionStorage,
		}),
	)

	app.use(compression())

	return app
}
