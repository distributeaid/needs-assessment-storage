import { Request, Response } from 'express'
import { URL } from 'url'
import { Form } from '../../../form/form.js'
import { errorsToProblemDetail } from '../../../input-validation/errorsToProblemDetail.js'
import { JSONSchema } from '../../../schema/JSONSchema.js'
import { validateWithJSONSchema } from '../../../schema/validateWithJSONSchema.js'
import { Store } from '../../../storage/store.js'
import { ulid } from '../../../ulid.js'
import { HTTPStatusCode } from '../../response/HttpStatusCode.js'
import { respondWithProblem } from '../../response/problem.js'

export const formCreationHandler =
	({
		storage,
		endpoint,
		schema,
	}: {
		storage: Store<Form>
		endpoint: URL
		schema: JSONSchema
	}) =>
	async (request: Request, response: Response): Promise<void> => {
		const formBody = request.body
		const validForm = validateWithJSONSchema({
			schema,
		})(formBody)
		if ('errors' in validForm) {
			return respondWithProblem(
				request,
				response,
				errorsToProblemDetail(validForm.errors),
			)
		}
		const id = ulid()
		await storage.persist(id, {
			...formBody,
			$id: new URL(`./form/${id}`, endpoint),
		})
		response
			.status(HTTPStatusCode.Created)
			.header('Location', new URL(`./form/${id}`, endpoint).toString())
			.end()
	}
