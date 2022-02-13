import { Request, Response } from 'express'
import {
	AuthContext,
	expireAuthCookie,
	ExpressCookieForUserFn,
} from '../../authenticateRequest.js'
import { HTTPStatusCode } from '../response/HttpStatusCode.js'

export const renewCookie =
	(authCookie: ExpressCookieForUserFn) =>
	async (request: Request, response: Response): Promise<void> => {
		const authContext = request.user as AuthContext
		// Generate new token
		const [name, val, options] = authCookie(authContext.email)
		response
			.status(HTTPStatusCode.NoContent)
			.cookie(name, val, options)
			.header('Expires', options.expires.toString())
			.end()
	}

export const deleteCookie = (_: Request, response: Response): void => {
	response
		.status(HTTPStatusCode.NoContent)
		.cookie(...expireAuthCookie())
		.end()
}
