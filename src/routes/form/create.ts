import { Request, Response } from 'express'
import { URL } from 'url'
import { Form } from '../../form/form'
import { errorsToProblemDetail } from '../../input-validation/errorsToProblemDetail'
import { validateWithFormSchema } from '../../schema/validateWithJSONSchema'
import { HTTPStatusCode } from '../../server/response/HttpStatusCode'
import { respondWithProblem } from '../../server/response/problem'
import { Store } from '../../storage/store'
import { ulid } from '../../ulid'

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
		const { errors } = validateWithFormSchema({
			baseURL: new URL('./schema/', origin),
			version,
		})(formBody)
		if (errors !== undefined) {
			return respondWithProblem(response, errorsToProblemDetail(errors))
		}
		const id = ulid()
		await storage.persist(id, formBody)
		response
			.status(HTTPStatusCode.Created)
			.header('Location', new URL(`./form/${id}`, origin).toString())
			.end()
	}
