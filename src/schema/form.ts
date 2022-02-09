import { URL } from 'url'
import { JSONSchema } from './JSONSchema'

export const form = ({ baseURL }: { baseURL: URL }): JSONSchema => ({
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: `${new URL('./form.schema.json', baseURL)}`,
  title: 'Distribute Aid Needs Assesment Form Schema',
  description:
    'Describes the JSON document which decribes needs assessment forms.',
  type: 'object',
  properties: {
    $schema: {
      description: 'URL to the JSON schema in use',
      type: 'string',
      format: 'url',
    },
    sections: {
      description: "Describes the form's sections",
      type: 'array',
      minItems: 1,
      items: {
        $ref: `${new URL('./section.schema.json', baseURL)}`,
      },
      uniqueItemProperties: ['id', 'title'],
    },
  },
  additionalProperties: false,
  required: ['$schema', 'sections'],
})
