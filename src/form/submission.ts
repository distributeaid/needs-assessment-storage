import { Type } from '@sinclair/typebox'

export const Response = Type.Record(
	Type.String(),
	Type.Record(
		Type.String(),
		Type.Union([
			Type.String(),
			Type.Array(Type.String()),
			Type.Tuple([Type.Number(), Type.String()]),
		]),
	),
)

export const Submission = Type.Object(
	{
		form: Type.String({
			format: 'uri',
		}),
		response: Response,
	},
	{ additionalProperties: false },
)
