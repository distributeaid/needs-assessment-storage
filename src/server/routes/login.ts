import { Type } from '@sinclair/typebox'
import { Request, Response } from 'express'
import {
	decodeAuthCookie,
	ExpressCookieForUserFn,
} from '../../authenticateRequest.js'
import { errorsToProblemDetail } from '../../input-validation/errorsToProblemDetail.js'
import { trimAll } from '../../input-validation/trimAll.js'
import { validateWithTypebox } from '../../input-validation/validateWithTypebox.js'
import { VerificationToken } from '../../storage/VerificationToken.js'
import { HTTPStatusCode } from '../response/HttpStatusCode.js'
import { respondWithProblem } from '../response/problem.js'
import { emailInput } from './register.js'

const loginInput = Type.Object(
	{
		email: emailInput,
		token: Type.String({ pattern: '^[0-9]{6}$', title: 'verification token' }),
	},
	{ additionalProperties: false },
)

const validateLoginInput = validateWithTypebox(loginInput)

const login =
	(authCookie: ExpressCookieForUserFn) =>
	async (request: Request, response: Response): Promise<void> => {
		const valid = validateLoginInput(trimAll(request.body))
		if ('errors' in valid) {
			return respondWithProblem(
				request,
				response,
				errorsToProblemDetail(valid.errors),
			)
		}

		const email = valid.value.email
		const token = VerificationToken.get({ email })

		if (token !== valid.value.token) {
			return respondWithProblem(request, response, {
				title: `Invalid token ${valid.value.token} for email ${valid.value.email}!`,
				status: HTTPStatusCode.Unauthorized,
			})
		}
		// Generate new token
		const [name, val, options] = authCookie(email)
		response
			.status(HTTPStatusCode.OK)
			.cookie(name, val, options)
			.header('Expires', options.expires.toString())
			.json(decodeAuthCookie(val))
			.end()
	}

export default login
