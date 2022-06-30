import { Type } from '@sinclair/typebox'
import { emailInput } from '../server/routes/register.js'
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
		author: emailInput,
	},
	{ additionalProperties: false },
)
