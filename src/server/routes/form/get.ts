import { Request, Response } from 'express'
import { Form } from '../../../form/form.js'
import { errorsToProblemDetail } from '../../../input-validation/errorsToProblemDetail.js'
import { validateWithTypebox } from '../../../input-validation/validateWithTypebox.js'
import { Store } from '../../../storage/store.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { respondWithProblem } from '../../response/problem.js'
import { idParamSchema } from '../idParamSchema.js'

const validateInput = validateWithTypebox(idParamSchema)

export const formGetHandler =
	({ storage }: { storage: Store<Form> }) =>
	async (request: Request, response: Response): Promise<void> => {
		const valid = validateInput(request.params)
		if ('errors' in valid) {
			return respondWithProblem(
				request,
				response,
				errorsToProblemDetail(valid.errors),
			)
		}
		let form: Form | undefined = undefined
		try {
			form = (await storage.get(valid.value.id))?.data
		} catch (error) {
			console.error(`Failed to get form`, valid.value.id, error)
		}
		if (form === undefined) {
			return respondWithProblem(request, response, {
				title: `Form ${valid.value.id} not found!`,
				status: HTTPStatusCode.NotFound,
			})
		}
		response
			.status(HTTPStatusCode.OK)
			.header('Content-Type', 'application/json; charset=utf-8')
			.send(JSON.stringify(form, null, 2))
			.end()
	}
