import { CookieOptions } from 'express'
import { Strategy as CookieStrategy } from 'passport-cookie'

type AuthCookiePayload = {
  /** email */
  e: string
  /** is admin */
  a: boolean
}

export type AuthContext = {
  email: string
  isAdmin: boolean
}

export const authCookieName = 'auth'
export const cookieAuthStrategy = new CookieStrategy(
  {
    cookieName: authCookieName,
    signed: true,
  },
  async (value: string, done: any) => {
    try {
      return done(null, decodeAuthCookie(value))
    } catch (error) {
      return done(
        null,
        false,
        new Error(
          `Failed to decode cookie payload: ${(error as Error).message}!`,
        ),
      )
    }
  },
)

export type ExpressCookieInfo = [
  authCookieName: string,
  cookie: string,
  options: CookieOptions & { expires: Date },
]
export type ExpressCookieForUserFn = (email: string) => ExpressCookieInfo

export const authCookie =
  (lifetimeInSeconds: number, adminEmails: string[]) =>
  (email: string): ExpressCookieInfo =>
    [
      authCookieName,
      JSON.stringify({
        e: email,
        a: adminEmails.includes(email.toLowerCase()),
      }),
      {
        signed: true,
        secure: true,
        httpOnly: true,
        expires: new Date(Date.now() + lifetimeInSeconds * 1000),
        sameSite: 'none',
      },
    ]

// Sends an expired cookie to the client so it will be removed
export const expireAuthCookie = (): [string, string, CookieOptions] => [
  authCookieName,
  '',
  {
    signed: true,
    secure: true,
    httpOnly: true,
    expires: new Date(Date.now() - 60 * 1000),
    sameSite: 'none',
  },
]

export const decodeAuthCookie = (value: string): AuthContext => {
  const { e: email, a: isAdmin } = JSON.parse(value) as AuthCookiePayload
  return { email, isAdmin }
}
