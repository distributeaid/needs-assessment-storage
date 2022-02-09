import EventEmitter from 'events'
import { createServer } from 'http'
import { URL } from 'url'
import { backend } from './feat/backend.js'
import { setUp as setUpEmails } from './feat/emails.js'

const version = process.env.COMMIT_ID ?? '0.0.0-development'
console.debug(`Launching version ${version}`)

const omnibus = new EventEmitter()

let origin: URL
try {
  origin = new URL(process.env.ORIGIN ?? '')
} catch (err) {
  console.error(
    `Must set ORIGIN, current value is not a URL: "${process.env.ORIGIN}": ${
      (err as Error).message
    }!`,
  )
  process.exit(1)
}

const app = backend({
  omnibus,
  origin,
  version,
  cookieSecret: process.env.COOKIE_SECRET,
  cookieLifetimeSeconds:
    process.env.COOKIE_LIFETIME_SECONDS !== undefined
      ? parseInt(process.env.COOKIE_LIFETIME_SECONDS, 10)
      : undefined,
  adminEmails: (process.env.ADMIN_EMAILS ?? '').split(','),
})

const httpServer = createServer(app)
const port = parseInt(process.env.PORT ?? '8080', 10)
httpServer.listen(port, '0.0.0.0', (): void => {
  console.debug(`ℹ️ Listening on port:`, port)
  console.debug(`ℹ️ Origin:`, origin.toString())
})

// Configure email sending
setUpEmails(omnibus)
