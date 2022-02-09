import bodyParser from 'body-parser'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import EventEmitter from 'events'
import express, { Express } from 'express'
import passport from 'passport'
import { URL } from 'url'
import { v4 } from 'uuid'
import { authCookie, cookieAuthStrategy } from '../../authenticateRequest.js'
import { addVersion } from '../../input-validation/addVersion.js'
import { deleteCookie, renewCookie } from '../../routes/cookie.js'
import login from '../../routes/login.js'
import registerUser from '../../routes/register.js'
import { schemaHandler } from '../../routes/schema/schema.js'
import { form } from '../../schema/form.js'
import { question } from '../../schema/question.js'
import { section } from '../../schema/section.js'
import { addRequestId } from '../addRequestId.js'

export const backend = ({
  omnibus,
  cookieSecret,
  cookieLifetimeSeconds,
  origin,
  version,
  generateToken,
  adminEmails,
}: {
  omnibus: EventEmitter
  origin: URL
  cookieSecret?: string
  cookieLifetimeSeconds?: number
  adminEmails: string[]
  version: string
  /**
   * This functions is used to generate confirmation tokens send to users to validate their email addresses.
   */
  generateToken?: () => string
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
  app.use(cookieParser(cookieSecret ?? v4()))
  app.use(bodyParser.json())
  app.use(passport.initialize())
  const cookieAuth = passport.authenticate('cookie', { session: false })
  passport.use(cookieAuthStrategy)

  app.use(
    cors({
      origin: `${origin.protocol}//${origin.host}`,
      credentials: true,
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
  const schemaBaseURL = new URL('./schema/', origin)
  app.get(
    '/schema/form.schema.json',
    schemaHandler(form({ baseURL: schemaBaseURL })),
  )
  app.get(
    '/schema/section.schema.json',
    schemaHandler(section({ baseURL: schemaBaseURL })),
  )
  app.get(
    '/schema/question.schema.json',
    schemaHandler(question({ baseURL: schemaBaseURL })),
  )

  app.use(compression())

  return app
}
