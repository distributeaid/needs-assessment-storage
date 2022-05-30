import { escapeCellForTSV } from './escapeCellForTSV.js'

describe('escapeTSVLine()', () => {
	it('should escape entries with newlines in cells', () =>
		expect(escapeCellForTSV('Line 1\nLine 2 with "quotes"\nLine 3')).toEqual(
			'"Line 1\nLine 2 with ""quotes""\nLine 3"',
		))
})
