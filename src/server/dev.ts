import EventEmitter from 'events'
import { createServer } from 'http'
import * as path from 'path'
import { URL } from 'url'
import { jsonFileStore } from '../storage/file.js'
import { backend } from './feat/backend.js'
import { setUp as setUpEmails } from './feat/emails.js'
import { startpage } from './feat/startpage.js'

const omnibus = new EventEmitter()

const port = parseInt(process.env.PORT ?? '3000', 10)
const origin = new URL(`http://localhost:${port}`)

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
	.split(',')
	.filter((e) => e.length > 0)

const storageBaseDir = path.join(process.cwd(), 'storage')

const version = '0.0.0-development'

const app = backend({
	omnibus,
	cookieSecret: process.env.COOKIE_SECRET,
	cookieLifetimeSeconds:
		process.env.COOKIE_LIFETIME_SECONDS === undefined
			? 1800
			: parseInt(process.env.COOKIE_LIFETIME_SECONDS, 10),
	origin,
	version,
	generateToken: () => '123456',
	adminEmails,
	formStorage: jsonFileStore({
		directory: path.join(process.cwd(), 'storage', 'forms'),
	}),
	submissionStorage: jsonFileStore({
		directory: path.join(process.cwd(), 'storage', 'submissions'),
	}),
})

startpage(app, origin, version)

const httpServer = createServer(app)

httpServer.listen({ port }, (): void => {
	console.debug(`ℹ️ Listening on port:`, port)
	console.debug(`ℹ️ Origin:`, origin.toString())
	console.debug(`ℹ️ Storage:`, storageBaseDir)
})

// Configure email sending
setUpEmails(omnibus, adminEmails)
