import { generateDigits } from './generateDigits.js'

describe('generateDigits', () => {
  it('should generate a specific number of random digits', () =>
    expect(generateDigits(6)).toMatch(/^[0-9]{6}$/))
})
