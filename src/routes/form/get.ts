import { Type } from '@sinclair/typebox'
import { Request, Response } from 'express'
import { Form } from '../../form/form'
import { errorsToProblemDetail } from '../../input-validation/errorsToProblemDetail'
import { validateWithTypebox } from '../../input-validation/validateWithTypebox'
import { HTTPStatusCode } from '../../server/response/HttpStatusCode'
import { respondWithProblem } from '../../server/response/problem'
import { Store } from '../../storage/store'
import { ulidRegEx } from '../../ulid'

const input = Type.Object(
	{
		id: Type.RegEx(ulidRegEx),
	},
	{ additionalProperties: false },
)

const validateInput = validateWithTypebox(input)

export const formGetHandler =
	({ storage }: { storage: Store<Form> }) =>
	async (request: Request, response: Response): Promise<void> => {
		const valid = validateInput(request.params)
		if ('errors' in valid) {
			return respondWithProblem(response, errorsToProblemDetail(valid.errors))
		}
		const form = await storage.get(valid.value.id)
		if (form === undefined) {
			response.status(HTTPStatusCode.NotFound).end()
			return
		}
		response.status(HTTPStatusCode.OK).json(form).end()
	}
