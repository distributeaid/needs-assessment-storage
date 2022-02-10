import id128 from 'id128'

export const ulid = (): string => id128.Ulid.generate().toCanonical()

export const ulidRegEx = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/
