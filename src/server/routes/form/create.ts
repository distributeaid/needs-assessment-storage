import { Request, Response } from 'express'
import { URL } from 'url'
import { Form } from '../../../form/form.js'
import { errorsToProblemDetail } from '../../../input-validation/errorsToProblemDetail.js'
import { validateWithFormSchema } from '../../../schema/validateWithJSONSchema.js'
import { Store } from '../../../storage/store.js'
import { ulid } from '../../../ulid.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { respondWithProblem } from '../../response/problem.js'

export const formCreationHandler =
	({
		storage,
		origin,
		version,
	}: {
		storage: Store<Form>
		origin: URL
		version: string
	}) =>
	async (request: Request, response: Response): Promise<void> => {
		const formBody = request.body
		const validForm = validateWithFormSchema({
			baseURL: new URL('./schema/', origin),
			version,
		})(formBody)
		if ('errors' in validForm) {
			return respondWithProblem(
				response,
				errorsToProblemDetail(validForm.errors),
			)
		}
		const id = ulid()
		await storage.persist(id, {
			$id: new URL(`./form/${id}`, origin),
			...formBody,
		})
		response
			.status(HTTPStatusCode.Created)
			.header('Location', new URL(`./form/${id}`, origin).toString())
			.end()
	}
