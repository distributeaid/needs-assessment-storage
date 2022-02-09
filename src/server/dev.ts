import EventEmitter from 'events'
import { createServer } from 'http'
import { URL } from 'url'
import { backend } from './feat/backend.js'
import { setUp as setUpEmails } from './feat/emails.js'

const omnibus = new EventEmitter()

const port = parseInt(process.env.PORT ?? '3000', 10)
const origin = new URL(process.env.ORIGIN ?? `http://localhost:${port}`)

const app = backend({
  omnibus,
  cookieSecret: process.env.COOKIE_SECRET,
  cookieLifetimeSeconds:
    process.env.COOKIE_LIFETIME_SECONDS === undefined
      ? 1800
      : parseInt(process.env.COOKIE_LIFETIME_SECONDS, 10),
  origin,
  version: 'development',
  generateToken: () => '123456',
  adminEmails: (process.env.ADMIN_EMAILS ?? 'm@distributeaid.org').split(','),
})

const httpServer = createServer(app)

httpServer.listen({ port }, (): void => {
  console.debug(`ℹ️ Listening on port:`, port)
  console.debug(`ℹ️ Origin:`, origin.toString())
})

// Configure email sending
setUpEmails(omnibus)
