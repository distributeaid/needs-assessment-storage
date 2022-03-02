import { Type } from '@sinclair/typebox'
import EventEmitter from 'events'
import { Request, Response } from 'express'
import { events } from '../../events.js'
import { generateDigits } from '../../generateDigits.js'
import { errorsToProblemDetail } from '../../input-validation/errorsToProblemDetail.js'
import { trimAll } from '../../input-validation/trimAll.js'
import { validateWithTypebox } from '../../input-validation/validateWithTypebox.js'
import { VerificationToken } from '../../storage/VerificationToken.js'
import { getRequestId } from '../addRequestId.js'
import { HTTPStatusCode } from '../response/HttpStatusCode.js'
import { respondWithProblem } from '../response/problem.js'

export const emailInput = Type.String({
	format: 'email',
	title: 'Email',
})

const registerUserInput = Type.Object(
	{
		email: emailInput,
	},
	{ additionalProperties: false },
)

const validateRegisterUserInput = validateWithTypebox(registerUserInput)

// Remember already registered users so their emails can't be spammed
const UserRegisterLock: Record<string, number> = {}

const registerUser =
	(omnibus: EventEmitter, generateToken = () => generateDigits(6)) =>
	async (request: Request, response: Response): Promise<void> => {
		const valid = validateRegisterUserInput(trimAll(request.body))
		if ('errors' in valid) {
			return respondWithProblem(
				request,
				response,
				errorsToProblemDetail(valid.errors),
			)
		}

		const email = valid.value.email

		if (
			UserRegisterLock[email.toLowerCase()] !== undefined &&
			Date.now() - UserRegisterLock[email.toLowerCase()] < 60 * 1000
		) {
			return respondWithProblem(request, response, {
				title: `User with email ${valid.value.email} already registered!`,
				status: HTTPStatusCode.Conflict,
			})
		}
		UserRegisterLock[email.toLowerCase()] = Date.now()

		try {
			// Generate new token
			const token = generateToken()
			VerificationToken.set({
				email,
				token,
			})
			omnibus.emit(events.user_registered, email, token)
			response.status(HTTPStatusCode.Accepted).end()
			return
		} catch (error) {
			console.error(getRequestId(response), error)
			respondWithProblem(request, response, {
				title: 'An unexpected problem occurred.',
				status: HTTPStatusCode.InternalError,
				detail: `Request ID: ${getRequestId(response)}`,
			})
			return
		}
	}

export default registerUser
