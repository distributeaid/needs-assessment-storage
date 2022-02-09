import { json } from 'body-parser'
import cookieParser from 'cookie-parser'
import EventEmitter from 'events'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import passport from 'passport'
import request, { SuperTest, Test } from 'supertest'
import { v4 } from 'uuid'
import {
  authCookie as getAuthCookie,
  authCookieName,
  cookieAuthStrategy,
  decodeAuthCookie,
} from '../authenticateRequest.js'
import { deleteCookie, renewCookie } from '../routes/cookie.js'
import login from '../routes/login.js'
import registerUser from '../routes/register.js'
import { HTTPStatusCode } from './response/HttpStatusCode.js'

jest.setTimeout(15 * 1000)

const cookieAuth = passport.authenticate('cookie', { session: false })
passport.use(cookieAuthStrategy)

const tokenCookieRx = new RegExp(`${authCookieName}=([^;]+);`, 'i')

const parseCookie = (cookie: string) =>
  cookie
    .split('; ')
    .map((s) => s.split('=', 2))
    .reduce(
      (c, [k, v], i) =>
        i === 0
          ? {
              [decodeURIComponent(k)]: v ? decodeURIComponent(v) : true,
            }
          : {
              ...c,
              options: {
                ...c.options,
                [decodeURIComponent(k)]: v ? decodeURIComponent(v) : true,
              },
            },
      {} as Record<string, any>,
    )

const email = `${v4()}@example.com`
const omnibus = new EventEmitter()

describe('User account API', () => {
  let app: Express
  let httpServer: Server
  let r: SuperTest<Test>

  const adminEmail = `some-admin${v4()}@example.com`
  const getExpressCookie = getAuthCookie(1800, [adminEmail])
  let authCookie: string
  beforeAll(async () => {
    app = express()
    app.use(cookieParser(process.env.COOKIE_SECRET ?? 'cookie-secret'))
    app.use(json())
    app.use(passport.initialize())
    app.post(
      '/auth/register',
      registerUser(omnibus, () => '123456'),
    )
    app.post('/auth/login', login(getExpressCookie))
    app.get('/auth/cookie', cookieAuth, renewCookie(getExpressCookie))
    app.delete('/auth/cookie', cookieAuth, deleteCookie)
    httpServer = createServer(app)
    await new Promise<void>((resolve) =>
      httpServer.listen(8888, '127.0.0.1', undefined, resolve),
    )
    r = request('http://127.0.0.1:8888')
  })
  afterAll(async () => {
    httpServer.close()
  })
  describe('/auth/register', () => {
    it('should register a new user account', async () => {
      await r
        .post('/auth/register')
        .set('Content-type', 'application/json; charset=utf-8')
        .send({
          email,
        })
        .expect(HTTPStatusCode.Accepted)
    })
    it.each([
      [email],
      [
        email.toUpperCase(), // emails are case-insensitive
      ],
    ])(
      'should not allow to register with the same email (%s) twice',
      async (email) =>
        r
          .post('/auth/register')
          .set('Content-type', 'application/json; charset=utf-8')
          .send({
            email,
          })
          .expect(HTTPStatusCode.Conflict, {
            title: `User with email ${email} already registered!`,
            status: HTTPStatusCode.Conflict,
          }),
    )
  })
  describe('/auth/login', () => {
    it('should return a token on login', async () => {
      const res = await r
        .post('/auth/login')
        .send({
          email,
          token: '123456',
        })
        .expect(HTTPStatusCode.NoContent)
        .expect('set-cookie', tokenCookieRx)

      const cookieInfo = parseCookie(res.header['set-cookie'][0] as string)
      expect(cookieInfo[authCookieName]).toBeDefined()
      expect(cookieInfo.options).toMatchObject({
        Path: '/',
        HttpOnly: true,
        SameSite: 'None',
      })
      const expiresIn =
        new Date(cookieInfo.options.Expires).getTime() - Date.now()
      expect(expiresIn).toBeLessThan(30 * 60 * 1000)
      expect(expiresIn).toBeGreaterThan(0)
      authCookie = tokenCookieRx.exec(res.header['set-cookie'])?.[1] as string
    })
    it('should send cookie expiry time in the expires header', async () => {
      const res = await r
        .post('/auth/login')
        .send({
          email,
          token: '123456',
        })
        .expect(HTTPStatusCode.NoContent)
      const expiresIn = new Date(res.headers['expires']).getTime() - Date.now()
      expect(expiresIn).toBeLessThan(30 * 60 * 1000)
      expect(expiresIn).toBeGreaterThan(0)
    })
    it('should fail with invalid token', async () =>
      r
        .post('/auth/login')
        .send({
          email,
          token: '666666',
        })
        .expect(HTTPStatusCode.Unauthorized, {
          title: `Invalid token 666666 for email ${email}!`,
          status: HTTPStatusCode.Unauthorized,
        }))
    it('should fail with user not found', async () =>
      r
        .post('/auth/login')
        .send({
          email: 'foo@example.com',
          token: '123456',
        })
        .expect(HTTPStatusCode.Unauthorized, {
          title: `Invalid token 123456 for email foo@example.com!`,
          status: HTTPStatusCode.Unauthorized,
        }))
    it('should set the isAdmin flag in the cookie to false for users', () =>
      expect(
        decodeAuthCookie(
          decodeURIComponent(authCookie.replace(/\.[^.]+$/, '')).substring(2),
        ).isAdmin,
      ).toBe(false))
    it('should set the isAdmin flag in the cookie to true for admins', async () => {
      await r
        .post('/auth/register')
        .set('Content-type', 'application/json; charset=utf-8')
        .send({
          email: adminEmail,
        })
        .expect(HTTPStatusCode.Accepted)

      const res = await r
        .post('/auth/login')
        .send({
          email: adminEmail,
          token: '123456',
        })
        .expect(HTTPStatusCode.NoContent)
        .expect('set-cookie', tokenCookieRx)

      expect(
        decodeAuthCookie(
          decodeURIComponent(
            (
              tokenCookieRx.exec(res.header['set-cookie'])?.[1] as string
            ).replace(/\.[^.]+$/, ''),
          ).substring(2),
        ).isAdmin,
      ).toBe(true)
    })
  })
  describe('/auth/cookie', () => {
    it('should send a new cookie', async () =>
      r
        .get('/auth/cookie')
        .set('Cookie', [`${authCookieName}=${authCookie}`])
        .expect(HTTPStatusCode.NoContent))
    it('should send cookie expiry time in the expires header', async () => {
      const res = await r
        .get('/auth/cookie')
        .set('Cookie', [`${authCookieName}=${authCookie}`])
        .expect(HTTPStatusCode.NoContent)
      const expiresIn = new Date(res.headers['expires']).getTime() - Date.now()
      expect(expiresIn).toBeLessThan(30 * 60 * 1000)
      expect(expiresIn).toBeGreaterThan(0)
    })
    it('should delete a cookie', async () => {
      const res = await r
        .delete('/auth/cookie')
        .set('Cookie', [`${authCookieName}=${authCookie}`])
        .expect(HTTPStatusCode.NoContent)
      const cookieInfo = parseCookie(res.header['set-cookie'][0] as string)
      expect(cookieInfo[authCookieName]).toBeDefined()
      expect(cookieInfo.options).toMatchObject({
        Path: '/',
        HttpOnly: true,
        SameSite: 'None',
      })
      const expiresIn =
        new Date(cookieInfo.options.Expires).getTime() - Date.now()
      expect(expiresIn).toBeLessThan(0) // Expires is in the past
    })
  })
})
