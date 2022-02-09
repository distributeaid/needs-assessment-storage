import { URL } from 'url'
import { JSONSchema } from './JSONSchema'

export const section = ({ baseURL }: { baseURL: URL }): JSONSchema => ({
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: `${new URL('./section.schema.json', baseURL)}`,
  title: 'Sections of a form',
  description: 'A form is divided into multiple sections',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      description:
        'The id of a section is used to reference it in the response, but also in JSONata expression, therefore the format is limited to the pattern.',
      pattern: '^[a-z]([a-zA-Z0-9]+)?$',
    },
    title: {
      type: 'string',
      minLength: 1,
    },
    description: {
      description: 'Further explanation of this section.',
      type: 'string',
      minLength: 1,
    },
    internalComment: {
      description: 'A comment (should not be shown to users).',
      type: 'string',
      minLength: 1,
    },
    hidden: {
      description:
        'whether to hide this section, can either be statically disabled, or be a JSONata expression',
      oneOf: [{ type: 'boolean' }, { type: 'string', minLength: 1 }],
    },
    questions: {
      type: 'array',
      minItems: 1,
      items: {
        $ref: `${new URL('./question.schema.json', baseURL)}`,
      },
      uniqueItemProperties: ['id', 'title'],
    },
  },
  additionalProperties: false,
  required: ['id', 'title', 'questions'],
})
