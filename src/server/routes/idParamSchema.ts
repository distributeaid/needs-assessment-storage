import { Type } from '@sinclair/typebox'
import { ulidExclusiveRegEx } from '../../ulid'

export const idParamSchema = Type.Object(
	{
		id: Type.RegEx(ulidExclusiveRegEx),
	},
	{ additionalProperties: false },
)
