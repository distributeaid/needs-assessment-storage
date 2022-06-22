import { Type } from '@sinclair/typebox'
import { Response } from './submission.js'

export const Correction = Type.Object(
	{
		form: Type.String({
			format: 'uri',
		}),
		submission: Type.String({
			format: 'uri',
		}),
		submissionVersion: Type.Integer({
			minimum: 1,
			title: 'version number',
		}),
		response: Response,
	},
	{ additionalProperties: false },
)
