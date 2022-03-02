import { fromEnv } from '@nordicsemiconductor/from-env'
import EventEmitter from 'events'
import * as fs from 'fs'
import { createServer } from 'http'
import path from 'path/posix'
import { URL } from 'url'
import { jsonFileStore } from '../storage/file.js'
import { backend } from './feat/backend.js'
import { setUp as setUpEmails } from './feat/emails.js'
import { startpage } from './feat/startpage.js'

const { originString, cleverCloudFsBucket, appHome, endpointString } = fromEnv({
	appHome: 'APP_HOME',
	originString: 'ORIGIN',
	endpointString: 'ENDPOINT',
	cleverCloudFsBucket: 'CC_FS_BUCKET',
})(process.env)

const storageBaseDir = `${appHome}/${cleverCloudFsBucket.split(':')[0]}`
const submissionsDir = path.join(storageBaseDir, 'submission')
const formsDir = path.join(storageBaseDir, 'forms')
try {
	fs.statSync(submissionsDir)
} catch {
	fs.mkdirSync(submissionsDir, { recursive: true })
}
try {
	fs.statSync(formsDir)
} catch {
	fs.mkdirSync(formsDir, { recursive: true })
}

const version = process.env.COMMIT_ID ?? '0.0.0-development'
console.debug(`Launching version ${version}`)

const omnibus = new EventEmitter()

let origin: URL
try {
	origin = new URL(originString)
} catch (err) {
	console.error(
		`Must set ORIGIN, current value is not a URL: "${process.env.ORIGIN}": ${
			(err as Error).message
		}!`,
	)
	process.exit(1)
}

let endpoint: URL
try {
	endpoint = new URL(endpointString)
} catch (err) {
	console.error(
		`Must set ENDPOINT, current value is not a URL: "${
			process.env.ENDPOINT
		}": ${(err as Error).message}!`,
	)
	process.exit(1)
}

const port = parseInt(process.env.PORT ?? '8080', 10)

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
	.split(',')
	.filter((e) => e.length > 0)

const app = backend({
	omnibus,
	origin,
	endpoint,
	version,
	cookieSecret: process.env.COOKIE_SECRET,
	cookieLifetimeSeconds:
		process.env.COOKIE_LIFETIME_SECONDS !== undefined
			? parseInt(process.env.COOKIE_LIFETIME_SECONDS, 10)
			: undefined,
	adminEmails,
	formStorage: jsonFileStore({ directory: formsDir }),
	submissionStorage: jsonFileStore({
		directory: submissionsDir,
	}),
})

startpage(app, endpoint, version)

const httpServer = createServer(app)

httpServer.listen(port, '0.0.0.0', (): void => {
	console.debug(`ℹ️ Listening on port:`, port)
	console.debug(`ℹ️ Endpoint:`, endpoint.toString())
	console.debug(`ℹ️ Origin:`, origin.toString())
	console.debug(`ℹ️ Storage:`, storageBaseDir)
})

// Configure email sending
setUpEmails(omnibus, adminEmails)
