/**
 * Defines re-usable types for input validation.
 */

import { TString, Type } from '@sinclair/typebox'

export const URI = Type.String({ format: 'uri', title: 'URI' })

export const DateTime = Type.String({ format: 'date-time', title: 'date' })

export const NonEmptyLimitedString = ({
  maxLength,
  title,
}: {
  /* Positive integer */
  maxLength: number
  title: string
}): TString =>
  Type.String({
    minLength: 1,
    maxLength,
    title,
  })

export const NonEmptyShortString = NonEmptyLimitedString({
  maxLength: 255,
  title: 'non-empty short string',
})

export const ID = Type.Integer({ minimum: 1, title: 'ID' })
export const PositiveInteger = Type.Integer({
  minimum: 1,
  title: 'positive integer',
})
