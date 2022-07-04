import { Type } from '@sinclair/typebox'
import { ulidExclusiveRegEx } from '../../ulid.js'

export const idParamSchema = Type.Object(
	{
		id: Type.RegEx(ulidExclusiveRegEx),
	},
	{ additionalProperties: false },
)
