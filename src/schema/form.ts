import { URL } from 'url'
import { JSONSchema } from './JSONSchema.js'
import { sectionsSchema } from './sections.js'

export const formSchema = ({ $id }: { $id: URL }): JSONSchema => ({
	$schema: 'http://json-schema.org/draft-07/schema#',
	$id: $id.toString(),
	title: 'Distribute Aid Needs Assesment Form Schema',
	description:
		'Describes the JSON document which decribes needs assessment forms.',
	type: 'object',
	properties: {
		$schema: {
			description: 'URL to the JSON schema in use',
			const: $id.toString(),
		},
		sections: sectionsSchema,
	},
	additionalProperties: false,
	required: ['$schema', 'sections'],
})
